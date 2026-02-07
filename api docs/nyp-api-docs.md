# New York Pizza Store Portal API Documentation

Based on analysis of your HAR file from `store.newyorkpizza.nl`

---

## Authentication

The portal uses **ASP.NET cookie-based authentication**. You'll need these cookies for all requests:

| Cookie | Purpose |
|--------|---------|
| `.AspNet.ApplicationCookie-S4D.Web.Store` | Main auth token (long-lived session) |
| `ASP.NET_SessionId` | Session identifier |
| `__RequestVerificationToken` | CSRF protection token |
| `ActiveStore` | Current store ID (e.g., `142`) |
| `DashboardApi` | API access token (GUID) |
| `INGRESSCOOKIE` | Load balancer sticky session |

---

## Discovered Endpoints

### 1. Generate Operational Report
```
POST /Reporting/Generate/Operationele
Content-Type: application/x-www-form-urlencoded
```

**Parameters:**
| Name | Example | Description |
|------|---------|-------------|
| `CancelUrl` | `/Reporting` | Redirect URL on cancel |
| `ReportId` | `25` | Report type ID |
| `DateStart` | `01-01-2026` | Start date (DD-MM-YYYY) |
| `DateEnd` | `31-01-2026` | End date (DD-MM-YYYY) |
| `IncludeSalesPerChannel` | `false` | Include channel breakdown |

---

### 2. View PDF Report
```
GET /Reporting/ViewPdf?encodedReportData={base64_json}
```

The `encodedReportData` is a Base64-encoded JSON object:

```json
{
  "ReportId": 25,
  "Filters": {
    "DateStart": "2026-01-01T06:00:00",
    "DateEnd": "2026-02-01T05:59:59.9999999",
    "Delivery": true,
    "Pickup": true,
    "PersonIds": [],
    "SplitOptionOnResult": false,
    "TopResults": 0,
    "AutenticatedUserId": 3200509,
    "FilterByDeliveryTypes": false,
    "FilterByReturnTypes": false,
    "FilterBtSupplierRouteIds": false,
    "ShowAllCashDrawerTransactions": false,
    "GroupByEmployeeShift": false,
    "IncludeSalesPerChannel": false,
    "ProductsIds": [],
    "Interval": 60,
    "SummarizeWeeks": false,
    "SummarizeDeliveryTypes": false,
    "StockProductId": 0,
    "AggregateRangeOption": 0,
    "HaveGroupingOption": false,
    "StoredProcedureName": ""
  }
}
```

---

### 3. Session/Activity Endpoints
```
GET  /Account/GetNotificationInterval
GET  /Account/GetFiscalNotificationInterval
POST /Account/UpdateLastActivity
```

---

### 4. Store Touchpoint
```
POST /Store/AddTouchpoint
Content-Type: application/x-www-form-urlencoded

clientId=5998f799e460ed41e83ad0617765c266
```

---

## Integration Strategy

### Option A: Session Replay (Recommended)

1. **Login manually** via browser with 2FA
2. **Extract cookies** from DevTools → Application → Cookies
3. **Store cookies** in your webapp's backend
4. **Make requests** with those cookies until session expires
5. **Re-authenticate** when needed

### Option B: Headless Browser Automation

Use Puppeteer/Playwright to:
1. Navigate to login page
2. Enter credentials
3. Handle 2FA (you input the code)
4. Extract cookies after successful login
5. Use cookies for API calls

---

## Example: Python Integration

```python
import requests
import base64
import json
from datetime import datetime

class NYPStoreAPI:
    BASE_URL = "https://store.newyorkpizza.nl"
    
    def __init__(self, cookies: dict):
        self.session = requests.Session()
        self.session.cookies.update(cookies)
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            "Accept": "application/json, text/html, */*",
            "Origin": self.BASE_URL,
            "Referer": f"{self.BASE_URL}/Reporting"
        })
    
    def get_operational_report(self, start_date: str, end_date: str, 
                                include_sales_per_channel: bool = False):
        """
        Generate operational report
        Dates in DD-MM-YYYY format
        """
        url = f"{self.BASE_URL}/Reporting/Generate/Operationele"
        data = {
            "CancelUrl": "/Reporting",
            "ReportId": "25",
            "DateStart": start_date,
            "DateEnd": end_date,
            "IncludeSalesPerChannel": str(include_sales_per_channel).lower()
        }
        response = self.session.post(url, data=data)
        return response
    
    def get_report_pdf(self, report_id: int, date_start: str, date_end: str,
                       user_id: int, delivery: bool = True, pickup: bool = True):
        """
        Get PDF report via encoded parameters
        Dates in ISO format: YYYY-MM-DDTHH:MM:SS
        """
        filters = {
            "ReportId": report_id,
            "Filters": {
                "DateStart": date_start,
                "DateEnd": date_end,
                "Delivery": delivery,
                "Pickup": pickup,
                "PersonIds": [],
                "SplitOptionOnResult": False,
                "TopResults": 0,
                "AutenticatedUserId": user_id,
                "FilterByDeliveryTypes": False,
                "FilterByReturnTypes": False,
                "FilterBtSupplierRouteIds": False,
                "ShowAllCashDrawerTransactions": False,
                "GroupByEmployeeShift": False,
                "IncludeSalesPerChannel": False,
                "ProductsIds": [],
                "Interval": 60,
                "SummarizeWeeks": False,
                "SummarizeDeliveryTypes": False,
                "StockProductId": 0,
                "AggregateRangeOption": 0,
                "HaveGroupingOption": False,
                "StoredProcedureName": ""
            }
        }
        
        encoded = base64.b64encode(json.dumps(filters).encode()).decode()
        url = f"{self.BASE_URL}/Reporting/ViewPdf?encodedReportData={encoded}"
        response = self.session.get(url)
        return response
    
    def keep_session_alive(self):
        """Call periodically to prevent session timeout"""
        url = f"{self.BASE_URL}/Account/UpdateLastActivity"
        return self.session.post(url)


# Usage example:
cookies = {
    ".AspNet.ApplicationCookie-S4D.Web.Store": "YOUR_COOKIE_VALUE",
    "ASP.NET_SessionId": "YOUR_SESSION_ID",
    "__RequestVerificationToken": "YOUR_TOKEN",
    "ActiveStore": "142",
    "DashboardApi": "YOUR_DASHBOARD_API_GUID",
    "INGRESSCOOKIE": "YOUR_INGRESS_COOKIE"
}

api = NYPStoreAPI(cookies)
report = api.get_operational_report("01-01-2026", "31-01-2026")
print(report.status_code)
```

---

## Important Notes

1. **Session Expiry**: The `OffSiteUserLastActivity_Store` cookie suggests ~11 hour session timeout
2. **CSRF Protection**: Some POST endpoints may require the `__RequestVerificationToken` in form data
3. **Store Context**: The `ActiveStore` cookie (value: `142`) determines which store's data you access
4. **Rate Limiting**: Cloudflare is in front — be gentle with request frequency
5. **Your User ID**: `3200509` (from the decoded report data)

---

## Next Steps

To discover more endpoints, capture HAR files while:
- Viewing orders
- Managing inventory  
- Viewing employee schedules
- Accessing settings

The more actions you capture, the more complete your API map becomes!
