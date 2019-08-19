[![Travis](https://travis-ci.com/reisman-internship-2019-greenmap/GreenMap-server.svg?branch=master)](https://travis-ci.com/reisman-internship-2019-greenmap/GreenMap-server)
![David](https://david-dm.org/reisman-internship-2019-greenmap/GreenMap-server.svg)

# Greenmap-Server

Greenmap-Server is a Node.js RESTful-api built to serve the [Greenmap-App](https://github.com/reisman-internship-2019-greenmap/GreenMap-app). 

[Postman API Documentation](https://documenter.getpostman.com/view/3989380/SVYqNe4f?version=latest#deeeef3a-93dd-450f-856f-c725ab237da5)

### Prerequisites

Ensure that Node.js and npm is installed on your device.

```
node --version // v11.14.0
npm --version // 6.9.0
```

Ensure that MongoDB is installed on your device.
```
mongo --version // MongoDB shell version v4.0.3
```

**How to use**
----

The Greenmap-Server has several endpoints for getting products and putting products into the Greenmap database. 



* ### Get Product

  Returns a product stored in the Greenmap Database.
    
    * **URL**
    
      `/:barcode`
    
    * **Method:**
    
      `GET`
      
    *  **URL Params**
    
       **Required:**
     
       ```
       http://serverhost:port/somebarcode
       ... 
       // e.g.
       http://localhost:3000/8152210266539
       ```
   
* ### Add Product By Lookup

  Adds a product to the Greenmap Database using a Barcodelookup request.
    
    * **URL**
    
      `/`
    
    * **Method:**
    
      `POST`
      
    *  **Body Params**
    
       **Required:**
     
       ```
       { barcode:'some barcode' }
       ... 
       // e.g.
       { barcode: '0886111601387' }
       ```

* ### Get top five manufacturers

  Returns at most top five manufacturers of the same category of product
    
    * **URL**
    
      `/products/:barcode`
    
    * **Method:**
    
      `GET`
      
    *  **URL Params**
    
       **Required:**
     
       ```
       http://serverhost:port/products/somebarcode
       ... 
       // e.g.
       http://localhost:3000/products/8152210266539
       ```
   
**Response codes**
----        

* ### Success Response:

  * **Code:** 200 <br />
    **Content:** 
    ```
    {
        "_id": "5cea1545c6a0a2ba74f5d2fb",
        "barcode": "0886111601387",
        "name": "HP 932XL Officejet Single Ink Cartridge - Black (CN053AN#14), Black (932xl)",
        "category": "Electronics > Print, Copy, Scan & Fax > Printer, Copier & Fax Machine Accessories > Printer Consumables > Toner & Inkjet Cartridges",
        "manufacturer": "Hp",
        "ESG": "0",
        "__v": 0
    }
    ```  
    
* ### Created:

  * **Code:** 201 <br />
    **Content:** 
    ```
    {
        "_id": "5cea1545c6a0a2ba74f5d2fb",
        "barcode": "0886111601387",
        "name": "HP 932XL Officejet Single Ink Cartridge - Black (CN053AN#14), Black (932xl)",
        "category": "Electronics > Print, Copy, Scan & Fax > Printer, Copier & Fax Machine Accessories > Printer Consumables > Toner & Inkjet Cartridges",
        "manufacturer": "Hp",
        "ESG": "0",
        "__v": 0
    }
    ```
          
* ### Bad Request:

  * **Code:** 400 BAD REQUEST <br />
    **Content:** 
    ```
    {
        // error message
    }
    ```
      
* ### Not Found:

  * **Code:** 404 NOT FOUND <br />
    **Content:** 
    ```
    {
        // error message
    }
    ```
        
* ### Precondition Failed:

  * **Code:** 413 PRECONDITION FAILED <br />
    **Content:** 
    ```
    {
        // error message
    }
    ```
    
* ### Internal Server Error:

  * **Code:** 500 INTERNAL SERVER ERROR <br />
    **Content:** 
    ```
    {
        // error message
    }
    ```  
