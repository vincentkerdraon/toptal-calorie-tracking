## User Endpoints

### Create a new food entry
**Endpoint:** `POST /api/foods`  
**Description:** Adds a new food entry.  
**Headers:**   
`Authorization: Bearer <token>`  
**Request Body:**
```json
{
    "timestamp": 1678901234567,
    "name": "Banana",
    "calories": 105,
    "cheating": false,
    "userId": "John.Doe"
}
```
**Response Codes:** 201, 400, 403, 5XX  
**Response Body:**
Same food object with an id.
```json
{
    "id": "id1",
    "timestamp": 1678901234567,
    "name": "Banana",
    "calories": 105,
    "cheating": false,
    "userId": "John.Doe"
}
```

**Example cURL command to test**
```sh
curl -X POST http://127.0.0.1:8080/api/foods \
-H "Authorization: Bearer token_John" \
-H "Content-Type: application/json" \
-d '{
    "timestamp": 1678901234567,
    "name": "Banana",
    "calories": 105,
    "cheating": false,
    "userId": "John.Doe"
}'
```

### Get all food entries
**Endpoint:** `GET /api/foods`  
**Description:** Retrieves a list of all food entries for a given user.  
**Headers:**  
`Authorization: Bearer <token>`  
**Parameters:**
userIDs=John.Doe,Jane.Smith
**Response Codes:** 200, 400, 403, 5XX  
**Response Body:**
```json
{
    "foods": [{
        "id": "id1",
        "timestamp": 1678901234567,
        "name": "Banana",
        "calories": 105,
        "cheating": false,
        "userId": "John.Doe"
    }]
}
```

**Example cURL command to test**
```sh
curl -X GET http://127.0.0.1:8080/api/foods?userIDs=John.Doe \
-H "Authorization: Bearer token_John"
```
or for all users
```sh
curl -X GET http://127.0.0.1:8080/api/foods \
-H "Authorization: Bearer token_Jessica" \
-H "Content-Type: application/json"
```

### Update a food entry
**Endpoint:** `PUT /api/foods/{id}`  
**Description:** Updates an existing food entry.  
**Headers:**  
`Authorization: Bearer <token>`  
**Request Body:**
```json
{
    "id": "id1",
    "timestamp": 1678901234567,
    "name": "Banana",
    "calories": 105,
    "cheating": false,
    "userId": "John.Doe"
}
```
**Response Codes:** 200, 400, 403, 404, 410, 5XX  
**Response Body:**
(what was sent)

**Example cURL command to test**
```sh
curl -X PUT http://127.0.0.1:8080/api/foods/id1 \
-H "Authorization: Bearer token_Jessica" \
-H "Content-Type: application/json" \
-d '{
    "id": "id1",
    "timestamp": 1678901234567,
    "name": "Banana",
    "calories": 105,
    "cheating": false,
    "userId": "John.Doe"
}'
```

### Delete a food entry
**Endpoint:** `DELETE /api/foods/{id}`  
**Description:** Deletes an existing food entry.  
**Headers:**  
`Authorization: Bearer <token>`

**Example cURL command to test**
```sh
curl -X DELETE http://127.0.0.1:8080/api/foods/id1 \
-H "Authorization: Bearer token_Jessica"
```