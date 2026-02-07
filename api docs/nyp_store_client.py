"""
New York Pizza Store Portal API Client
======================================

Usage:
1. Login to store.newyorkpizza.nl in your browser
2. Open DevTools → Application → Cookies
3. Copy the cookie values below
4. Run this script

Note: Cookies expire after ~11 hours of inactivity
"""

import requests
import base64
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

class NYPStoreClient:
    """Client for New York Pizza Store Portal API"""
    
    BASE_URL = "https://store.newyorkpizza.nl"
    
    def __init__(self, cookies: Dict[str, str]):
        """
        Initialize client with authentication cookies.
        
        Required cookies:
        - .AspNet.ApplicationCookie-S4D.Web.Store
        - ASP.NET_SessionId
        - __RequestVerificationToken
        - ActiveStore
        - DashboardApi
        - INGRESSCOOKIE
        """
        self.session = requests.Session()
        self.session.cookies.update(cookies)
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "nl-NL,nl;q=0.9",
            "Origin": self.BASE_URL,
        })
        self.store_id = cookies.get("ActiveStore", "")
        self.user_id = None  # Will be extracted from first report call
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Make authenticated request with error handling"""
        url = f"{self.BASE_URL}{endpoint}"
        kwargs.setdefault("headers", {})["Referer"] = self.BASE_URL
        
        response = self.session.request(method, url, **kwargs)
        
        # Check for session expiry (redirect to login)
        if response.status_code == 302 and "/Account/Login" in response.headers.get("Location", ""):
            raise SessionExpiredError("Session expired. Please refresh your cookies.")
        
        return response
    
    # ==================== REPORTING ====================
    
    def generate_operational_report(
        self,
        date_start: str,
        date_end: str,
        include_sales_per_channel: bool = False
    ) -> requests.Response:
        """
        Generate an operational report.
        
        Args:
            date_start: Start date in DD-MM-YYYY format
            date_end: End date in DD-MM-YYYY format
            include_sales_per_channel: Include channel breakdown
        
        Returns:
            Response object (HTML page with report)
        """
        data = {
            "CancelUrl": "/Reporting",
            "ReportId": "25",
            "DateStart": date_start,
            "DateEnd": date_end,
            "IncludeSalesPerChannel": str(include_sales_per_channel).lower()
        }
        return self._make_request("POST", "/Reporting/Generate/Operationele", data=data)
    
    def get_report_pdf(
        self,
        report_id: int,
        date_start: datetime,
        date_end: datetime,
        user_id: int,
        delivery: bool = True,
        pickup: bool = True,
        include_sales_per_channel: bool = False
    ) -> bytes:
        """
        Get a PDF report.
        
        Args:
            report_id: Report type ID (25 = Operational)
            date_start: Start datetime
            date_end: End datetime
            user_id: Authenticated user ID
            delivery: Include delivery orders
            pickup: Include pickup orders
            include_sales_per_channel: Include channel breakdown
        
        Returns:
            PDF file contents as bytes
        """
        filters = {
            "ReportId": report_id,
            "Filters": {
                "DateStart": date_start.isoformat(),
                "DateEnd": date_end.isoformat(),
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
                "IncludeSalesPerChannel": include_sales_per_channel,
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
        response = self._make_request("GET", f"/Reporting/ViewPdf?encodedReportData={encoded}")
        
        if response.headers.get("Content-Type", "").startswith("application/pdf"):
            return response.content
        else:
            raise APIError(f"Expected PDF, got: {response.headers.get('Content-Type')}")
    
    # ==================== SESSION ====================
    
    def keep_alive(self) -> bool:
        """
        Keep session alive by updating last activity.
        Call this periodically (e.g., every 10 minutes) to prevent session timeout.
        
        Returns:
            True if successful
        """
        response = self._make_request("POST", "/Account/UpdateLastActivity")
        return response.status_code == 200
    
    def get_notification_interval(self) -> Optional[int]:
        """Get notification check interval in seconds"""
        response = self._make_request("GET", "/Account/GetNotificationInterval")
        if response.status_code == 200:
            try:
                return int(response.text)
            except ValueError:
                return None
        return None
    
    # ==================== STORE ====================
    
    def add_touchpoint(self, client_id: str) -> requests.Response:
        """Add a touchpoint for tracking"""
        data = {"clientId": client_id}
        return self._make_request("POST", "/Store/AddTouchpoint", data=data)


class SessionExpiredError(Exception):
    """Raised when the session has expired"""
    pass


class APIError(Exception):
    """Raised when API returns unexpected response"""
    pass


# =============================================================================
# EXAMPLE USAGE
# =============================================================================

if __name__ == "__main__":
    # Step 1: Copy these values from your browser's DevTools
    # Go to: Application → Cookies → https://store.newyorkpizza.nl
    
    COOKIES = {
        ".AspNet.ApplicationCookie-S4D.Web.Store": "PASTE_YOUR_VALUE_HERE",
        "ASP.NET_SessionId": "PASTE_YOUR_VALUE_HERE",
        "__RequestVerificationToken": "PASTE_YOUR_VALUE_HERE",
        "ActiveStore": "142",  # Your store ID
        "DashboardApi": "PASTE_YOUR_VALUE_HERE",
        "INGRESSCOOKIE": "PASTE_YOUR_VALUE_HERE"
    }
    
    # Check if cookies are filled in
    if "PASTE_YOUR" in str(COOKIES.values()):
        print("❌ Please fill in your cookie values from DevTools!")
        print("\nHow to get cookies:")
        print("1. Login to store.newyorkpizza.nl")
        print("2. Open DevTools (F12)")
        print("3. Go to Application → Cookies")
        print("4. Copy each cookie value")
        exit(1)
    
    # Step 2: Create client and make requests
    client = NYPStoreClient(COOKIES)
    
    # Keep session alive
    print("Keeping session alive...")
    if client.keep_alive():
        print("✅ Session is active")
    
    # Generate a report for last month
    today = datetime.now()
    first_of_month = today.replace(day=1)
    last_month_end = first_of_month - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)
    
    print(f"\nGenerating report for {last_month_start.strftime('%d-%m-%Y')} to {last_month_end.strftime('%d-%m-%Y')}...")
    
    try:
        response = client.generate_operational_report(
            date_start=last_month_start.strftime("%d-%m-%Y"),
            date_end=last_month_end.strftime("%d-%m-%Y")
        )
        print(f"✅ Report generated! Status: {response.status_code}")
        
        # Save the HTML response
        with open("report.html", "w") as f:
            f.write(response.text)
        print("📄 Saved to report.html")
        
    except SessionExpiredError as e:
        print(f"❌ {e}")
        print("Please login again and update your cookies.")
    except Exception as e:
        print(f"❌ Error: {e}")
