#include <WiFi.h>
#include <FirebaseESP32.h>
#include <DHT.h>
#include "time.h"

const int RELAY_PIN = 23; 
const float TEMP_THRESHOLD = 30.0; 

#define WIFI_SSID "MERCUSYS"
#define WIFI_PASSWORD "ASPERASwifi0123"

#define FIREBASE_HOST "intelliroom-50474-default-rtdb.asia-southeast1.firebasedatabase.app" 
#define FIREBASE_AUTH "CRd2ytlGDz5EwNLu4ljcti7iiqTHq3I9J7OUvkn4" 

#define DHTPIN 4
#define DHTTYPE DHT11

const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 28800; // GMT+8 (Philippines)
const int daylightOffset_sec = 0;
struct tm timeinfo;

DHT dht(DHTPIN, DHTTYPE);

FirebaseData fbdo;
FirebaseData stream; 
FirebaseAuth auth;
FirebaseConfig config;

const long interval = 60000; 
unsigned long previousMillis = 0;

bool manualMode = false; 
bool manualFanStatus = false; 

void setFanRelay(bool state) {
    int relaySignal = state ? HIGH : LOW;

    digitalWrite(RELAY_PIN, relaySignal);
    if (Firebase.ready()) {
        if (Firebase.setBool(fbdo, "/intelliroom/fan_status", state)) {
            Serial.printf("Firebase Fan Status Updated: /intelliroom/fan_status set to %s\n", state ? "true" : "false");
        } else {
            Serial.println("Firebase Fan Status Update FAILED: " + fbdo.errorReason());
        }
    }
    Serial.printf("Relay Pin %d set to %s. Motor is now %s.\n", 
        RELAY_PIN, 
        relaySignal == HIGH ? "HIGH" : "LOW", 
        state ? "ON" : "OFF");
}

float readTemperature() {
    float t = dht.readTemperature();

      if (isnan(t)) {
        Serial.println("Failed to read from DHT sensor!");
        return 0.0; 
      }
      return t;
}

String formatDateTime() {
    if(!getLocalTime(&timeinfo)){
        Serial.println("Failed to obtain time. Using default.");
        return "0000-00-00 00:00:00";
    }
    char output[30]; 
        strftime(output, 30, "%Y-%m-%d %H:%M:%S", &timeinfo);
        return String(output);
}


void setup() {
    Serial.begin(115200);
    dht.begin(); 
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, LOW); 
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(500);
    }
    Serial.println("\nConnected with IP: ");
    Serial.println(WiFi.localIP());
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    config.database_url = FIREBASE_HOST;
    config.signer.tokens.legacy_token = FIREBASE_AUTH; 
    config.api_key = ""; 
    config.timeout.serverResponse = 10 * 1000;
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true); 
    if (!Firebase.beginStream(stream, "/")) { 
        Serial.println("Failed to start stream! " + stream.errorReason());
    }
}

void loop() {
    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis >= interval) {
        previousMillis = currentMillis; 
        float currentTemperature = readTemperature();
        String dateTimeStr = formatDateTime();
        if (Firebase.ready()) {
            if (Firebase.getBool(fbdo, "/intelliroom/manualMode")) {
                manualMode = fbdo.boolData();
            }
            if (Firebase.getBool(fbdo, "/intelliroom/manualFanState")) {
                manualFanStatus = fbdo.boolData();
            }
            Serial.printf("DEBUG READ: Mode=%s, Status=%s. Logic Result: %s\n", 
                manualMode ? "True" : "False", 
                manualFanStatus ? "True" : "False",
                (manualMode && manualFanStatus) ? "FAN SHOULD BE ON" : "FAN SHOULD BE OFF");
        }

    if (manualMode) {
        setFanRelay(manualFanStatus);
    } else {
        if (currentTemperature != 0.0) {
            if (currentTemperature >= TEMP_THRESHOLD) {     
                setFanRelay(true); 
            } else {
                setFanRelay(false); 
            }
        }
      }
      if (Firebase.ready() && currentTemperature != 0.0) {
        FirebaseJson json;
        json.add("Temperature", String(currentTemperature, 2)); 
        json.add("DateTime", dateTimeStr); 
        Serial.print("Attempting to push: ");
        Serial.println(dateTimeStr);
        if (Firebase.pushJSON(fbdo, "/temperature", json)) {
            Serial.println("PASSED: New record pushed successfully.");
        } else {
            Serial.println("FAILED: " + fbdo.errorReason());
        }
        if (Firebase.setFloat(fbdo, "/intelliroom/Current_Temperature", currentTemperature)) {
            Serial.println(" -> PASSED: Current Temperature updated.");
        } else {
            Serial.println("Real-Time Set FAILED: " + fbdo.errorReason());
        }
      }
     }
}