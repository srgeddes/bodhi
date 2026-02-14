export interface CategoryDefinition {
  name: string;
  subcategories: string[];
}

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { name: "Food & Dining", subcategories: ["Groceries", "Restaurants", "Coffee Shops", "Fast Food", "Bars & Alcohol", "Food Delivery"] },
  { name: "Transportation", subcategories: ["Gas & Fuel", "Parking", "Public Transit", "Ride Share", "Car Payment", "Car Insurance", "Car Maintenance"] },
  { name: "Housing", subcategories: ["Rent", "Mortgage", "Property Tax", "Home Insurance", "Home Maintenance", "HOA Fees"] },
  { name: "Utilities", subcategories: ["Electric", "Gas", "Water", "Internet", "Phone", "Trash"] },
  { name: "Shopping", subcategories: ["Clothing", "Electronics", "Home Goods", "Personal Care", "Gifts", "Books"] },
  { name: "Entertainment", subcategories: ["Streaming Services", "Movies & TV", "Music", "Games", "Sports", "Events & Concerts"] },
  { name: "Health & Fitness", subcategories: ["Doctor", "Dentist", "Pharmacy", "Gym & Fitness", "Vision", "Mental Health"] },
  { name: "Insurance", subcategories: ["Health Insurance", "Life Insurance", "Disability", "Other Insurance"] },
  { name: "Education", subcategories: ["Tuition", "Books & Supplies", "Student Loans", "Online Courses"] },
  { name: "Travel", subcategories: ["Flights", "Hotels", "Car Rental", "Vacation Activities", "Travel Insurance"] },
  { name: "Subscriptions", subcategories: ["Software", "News & Magazines", "Memberships", "Other Subscriptions"] },
  { name: "Personal", subcategories: ["Haircut & Beauty", "Laundry", "Pet Care", "Childcare"] },
  { name: "Income", subcategories: ["Salary", "Freelance", "Interest", "Dividends", "Rental Income", "Refunds", "Other Income"] },
  { name: "Investments", subcategories: ["Stocks", "Bonds", "Crypto", "Retirement", "Other Investments"] },
  { name: "Savings", subcategories: ["Emergency Fund", "Savings Account", "Other Savings"] },
  { name: "Taxes", subcategories: ["Federal Tax", "State Tax", "Property Tax", "Tax Preparation"] },
  { name: "Fees & Charges", subcategories: ["Bank Fees", "ATM Fees", "Late Fees", "Service Charges", "Interest Charges"] },
  { name: "Charity", subcategories: ["Donations", "Tithing", "Fundraising"] },
  { name: "Business", subcategories: ["Office Supplies", "Business Travel", "Professional Services", "Advertising"] },
  { name: "Uncategorized", subcategories: [] },
];

export const CATEGORY_NAMES = DEFAULT_CATEGORIES.map((c) => c.name);
