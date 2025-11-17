import { test, expect } from '@playwright/test';
import fetch from 'node-fetch';
import { parseStringPromise } from "xml2js";

const endpoint = 'http://localhost:8080/parabank/services/store-01';
const newItemId = Math.floor(Math.random() * 100000);

test.describe("bookstore web service", () => {
  test.describe.configure({ mode: 'serial' });
  test('possible to retrieve item info by id', async () => {
    const getByIdEnvelope =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
    xmlns:tns="http://bookstore.parasoft.com/">
    <soapenv:Header/>
      <soapenv:Body>
        <tns:getItemById xmlns:tns="http://bookstore.parasoft.com/">
          <id>1</id>
        </tns:getItemById>
      <soapenv:Body/>
    </soapenv:Envelope>`;

    const getByIdResponseText = await sendSoapRequest(getByIdEnvelope);
    expect(getByIdResponseText).toContain('<name>C++ How to Program (4th Edition)</name>');
  });

  test('possible to retrieve item info by title', async () => {
    const getByTitleEnvelope =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
    xmlns:tns="http://bookstore.parasoft.com/">
    <soapenv:Header/>
      <soapenv:Body>
        <tns:getItemByTitle xmlns:tns="http://bookstore.parasoft.com/">
          <titleKeyword>Linux Administration Handbook</titleKeyword>
        </tns:getItemByTitle>
      <soapenv:Body/>
    </soapenv:Envelope>`;

    const getByTitleResponseText = await sendSoapRequest(getByTitleEnvelope);
    expect(getByTitleResponseText).toContain('<id>4</id>');
    expect(getByTitleResponseText).toContain('<name>Linux Administration Handbook</name>');
  });

  test('possible to add item to inventory', async () => {
    const addNewItemEnvelope =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:tns="http://bookstore.parasoft.com/">
    <soapenv:Header/>
      <soapenv:Body>
        <tns:addNewItemToInventory>
          <book>
            <id>${newItemId}</id>
            <name>Epic fantasy part ${newItemId}</name>
            <price>12.34</price>
            <stockQuantity>10</stockQuantity>
            <authors>Jane Doe</authors>
            <description>Newest addition to popular series</description>
            <ISBN>9781234567890</ISBN>
            <publicationDate>2025-11-15T00:00:00</publicationDate>
            <publisher>Graphomania Publishing</publisher>
          </book>
        </tns:addNewItemToInventory>
      </soapenv:Body>
    </soapenv:Envelope>`;

    const addNewItemResponseText = await sendSoapRequest(addNewItemEnvelope);
    expect(addNewItemResponseText).toContain(`<id>${newItemId}</id>`);
    expect(addNewItemResponseText).toContain('<stockQuantity>10</stockQuantity>');

    // verify that new item was added to inventory
    const getByIdEnvelope =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
    xmlns:tns="http://bookstore.parasoft.com/">
    <soapenv:Header/>
      <soapenv:Body>
        <tns:getItemById xmlns:tns="http://bookstore.parasoft.com/">
          <id>${newItemId}</id>
        </tns:getItemById>
      <soapenv:Body/>
    </soapenv:Envelope>`;

    const getByIdResponseText = await sendSoapRequest(getByIdEnvelope);
    expect(getByIdResponseText).toContain(`<stockQuantity>10</stockQuantity>`);
    expect(getByIdResponseText).toContain(`<name>Epic fantasy part ${newItemId}</name>`);
    expect(getByIdResponseText).toContain('<price>12.34</price>');
  });

  test('possible to add item to cart and submit order', async () => {
    const addToCartEnvelope =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:tns="http://bookstore.parasoft.com/">
    <soapenv:Header/>
      <soapenv:Body>
        <tns:addItemToCart>
          <itemId>${newItemId}</itemId>
          <quantity>1</quantity>
          <cartId></cartId>
        </tns:addItemToCart>
      </soapenv:Body>
    </soapenv:Envelope>`;

    const addToCartResponseText = await sendSoapRequest(addToCartEnvelope);
    const currentCartId = await extractCartId(addToCartResponseText);

    // verify that item was added to cart
    const getCartContentEnvelope =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:tns="http://bookstore.parasoft.com/">
    <soapenv:Header/>
      <soapenv:Body>
        <tns:getItemsInCart>
          <cartId>${currentCartId}</cartId>
        </tns:getItemsInCart>
      </soapenv:Body>
    </soapenv:Envelope>`;

    const getCartContentResponseText = await sendSoapRequest(getCartContentEnvelope);
    expect(getCartContentResponseText).toContain(`<id>${newItemId}</id>`);
    expect(getCartContentResponseText).toContain(`<name>Epic fantasy part ${newItemId}</name>`);
    expect(getCartContentResponseText).toContain('<quantity>1</quantity>');

    // submit order
    const submitOrderEnvelope =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:tns="http://bookstore.parasoft.com/">
    <soapenv:Header/>
      <soapenv:Body>
        <tns:submitOrder>
          <cartId>${currentCartId}</cartId>
        </tns:submitOrder>
      </soapenv:Body>
    </soapenv:Envelope>`;

    const submitOrderResponseText = await sendSoapRequest(submitOrderEnvelope);
    expect(submitOrderResponseText).toContain('<success>true</success>');
  });

  test('not possible to update cart with more items than are in stock', async () => {
    // create a cart by adding 2 items into it
    const addToCartEnvelope =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:tns="http://bookstore.parasoft.com/">
    <soapenv:Header/>
      <soapenv:Body>
        <tns:addItemToCart>
            <itemId>${newItemId}</itemId>
            <quantity>2</quantity>
            <cartId></cartId>
        </tns:addItemToCart>
      </soapenv:Body>
    </soapenv:Envelope>`;

    const addToCartResponseText = await sendSoapRequest(addToCartEnvelope);
    const currentCartId = await extractCartId(addToCartResponseText);

    // try to update cart with more items than are in stock
    const updateCartContentEnvelope =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
      xmlns:tns="http://bookstore.parasoft.com/">
      <soapenv:Header/>
        <soapenv:Body>
          <tns:updateItemInCart>
            <cartId>${currentCartId}</cartId>
            <itemId>${newItemId}</itemId>
            <quantity>99</quantity>
          </tns:updateItemInCart>
        </soapenv:Body>
      </soapenv:Envelope>`;

    const updateCartResponseText = await sendSoapRequest(updateCartContentEnvelope, true);
    expect(updateCartResponseText).toContain(`<faultstring>Did not update order with cartId ${currentCartId}, 99 is greater than the quantity in stock: 10</faultstring>`);

    // verify that the cart still only has the 2 items added in first step
    const getCartContentEnvelope =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:tns="http://bookstore.parasoft.com/">
    <soapenv:Header/>
      <soapenv:Body>
        <tns:getItemsInCart>
          <cartId>${currentCartId}</cartId>
        </tns:getItemsInCart>
      </soapenv:Body>
    </soapenv:Envelope>`;

    const cartContentResponseText = await sendSoapRequest(getCartContentEnvelope);
    expect(cartContentResponseText).toContain(`<quantity>2</quantity>`);
  });




  /*
  * helper function for sending SOAP requests that returns the response as a string
  * if optional boolean "expectFailure" is true, then returns the response even if the response status is not 200
  */
  async function sendSoapRequest(
    soapEnvelope: string,
    expectFailure: boolean = false
  ): Promise<string> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': ''
      },
      body: soapEnvelope
    });

    const responseText = await response.text();

    if (response.status !== 200) {
      if (!expectFailure) {
        console.error(`SOAP request failed with status ${response.status}:`, responseText);
        throw new Error(`SOAP request failed with status ${response.status}`);
      }
      // return the response text even though status is not 200
      return responseText;
    }

    expect(response.status).toBe(200);
    return responseText;
  }

  /*
  * helper function to extract cartId from SOAP response string 
  */
  async function extractCartId(soapResponseText: string): Promise<string | null> {
    try {
      const parsedXml = await parseStringPromise(soapResponseText);
      const cartId =
        parsedXml?.["soap:Envelope"]?.["soap:Body"]?.[0]?.["ns2:addItemToCartResponse"]?.[0]?.["itemAdded"]?.[0]?.["cartId"]?.[0] ?? null;

      if (!cartId) {
        console.error("cartId not found in SOAP response:", JSON.stringify(parsedXml, null, 2));
        return null;
      }

      return cartId;
    } catch (err) {
      console.error("Failed to parse SOAP response:", err);
      return null;
    }
  }
});