from typing import List, Dict

STATES_AND_UTS = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    # Union Territories
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
]

DISTRICTS_MAP: Dict[str, List[str]] = {
    "Andhra Pradesh": ["Amaravati", "Visakhapatnam", "Vijayawada", "Guntur", "Kurnool", "Tirupati", "Anantapur", "Kakinada", "Nellore", "Rajahmundry"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Tawang", "Pasighat", "Ziro", "Bomdila"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tezpur", "Tinsukia"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah", "Begusarai"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Durg", "Jagdalpur"],
    "Goa": ["North Goa (Panaji)", "South Goa (Margao)"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar", "Rohtak", "Karnal", "Panchkula"],
    "Himachal Pradesh": ["Shimla", "Mandi", "Dharamshala", "Solan", "Kullu", "Hamirpur", "Bilaspur"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"],
    "Karnataka": ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru", "Hubballi-Dharwad", "Belagavi", "Kalaburagi", "Udupi", "Davangere"],
    "Kerala": ["Thiruvananthapuram", "Kochi (Ernakulam)", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Kottayam", "Palakkad"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Rewa", "Satna"],
    "Maharashtra": ["Mumbai", "Mumbai Suburban", "Pune", "Nagpur", "Thane", "Nashik", "Chhatrapati Sambhajinagar", "Solapur", "Amravati", "Kolhapur"],
    "Manipur": ["Imphal East", "Imphal West", "Churachandpur", "Thoubal"],
    "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali (SAS Nagar)", "Pathankot"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar"],
    "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore", "Erode"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Rangareddy", "Medchal-Malkajgiri"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Ghaziabad", "Prayagraj", "Meerut", "Gorakhpur", "Bareilly", "Aligarh"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Haldivani", "Roorkee", "Rishikesh", "Nainital"],
    "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol", "Bardhaman", "Kharagpur"],
    "Andaman and Nicobar Islands": ["Port Blair", "North and Middle Andaman", "South Andaman", "Nicobar"],
    "Chandigarh": ["Chandigarh Sector 1-17", "Chandigarh Sector 18-35", "Chandigarh Sector 36-60"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
    "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "South Delhi", "South West Delhi", "West Delhi"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
    "Ladakh": ["Leh", "Kargil"],
    "Lakshadweep": ["Kavaratti", "Agatti", "Amini"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
}

def get_all_states() -> List[str]:
    return sorted(STATES_AND_UTS)

def get_districts_for_state(state: str) -> List[str]:
    # Exact match first
    for s_name in DISTRICTS_MAP:
        if s_name.lower() == state.lower():
            return DISTRICTS_MAP[s_name]
    # Fallback default
    return ["District HQ", "Main City", "Other Region"]
