# Testing 

## To Compile and Run the program 

```bash
mvn compile
mvn spring-boot:run
```


### To test the status
```bash
curl -s http://localhost:8080/api/test/status
```


### Add Patients
To add a specific number of patients:
```bash
curl -X POST "http://localhost:8080/api/test/add?count=15"
```


### Remove All Patients (Clear)
To reset the system (clear database and queue):
```bash
curl -X POST http://localhost:8080/api/test/clear
```


### Staffing Management
To change the number of active doctors:
```bash
curl -X POST "http://localhost:8080/api/test/staffing?doctors=1"
```

# Current Parameters 
- Min no of patients = 10
