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
    "userId": "user123"
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
    "userId": "user123"
}
```

### Get all food entries
**Endpoint:** `GET /api/foods`  
**Description:** Retrieves a list of all food entries for a given user.  
**Headers:**  
`Authorization: Bearer <token>`  
**Request Body:**
```json
{
    "userIDs": ["id1", "id2"]
}
```
or for all users
```json
{
    "userIDs": null
}
```
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
        "userId": "user123"
    }]
}
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
    "userId": "user123"
}
```
**Response Codes:** 200, 400, 403, 404, 410, 5XX  
**Response Body:**
```json
{
    "id": "id1",
    "timestamp": 1678901234567,
    "name": "Banana",
    "calories": 105,
    "cheating": false,
    "userId": "user123"
}
```

### Delete a food entry
**Endpoint:** `DELETE /api/foods/{id}`  
**Description:** Deletes an existing food entry.  
**Headers:**  
`Authorization: Bearer <token>`