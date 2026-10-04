import random
from datetime import timedelta, datetime

def generate_product_sales(product_name, base_demand, days=90, category='electronics') -> list:
    sales = []
    start_date = datetime.now() - timedelta(days=days)
    
    for i in range(days):
        curr_date = start_date + timedelta(days=i)
        
        # Base
        daily_demand = base_demand
        
        # Seasonal multipliers
        month = curr_date.month
        if category == 'electronics':
            if month in [6, 7, 8]:
                daily_demand *= 1.20 # Summer +20%
            elif month in [11, 12, 1]:
                daily_demand *= 1.30 # Winter +30%
        elif category == 'outdoor sports':
            if month in [11, 12, 1]:
                daily_demand *= 0.90 # Winter -10%
                
        # Weekly cycle (Friday, Saturday, Sunday = 4, 5, 6)
        if curr_date.weekday() >= 4:
            daily_demand *= 1.30 # Weekend +30%
            
        # Random noise +/- 15%
        noise_factor = random.uniform(0.85, 1.15)
        daily_demand *= noise_factor
        
        is_promotion = False
        
        # Price 
        price = 299.99 if category == 'electronics' else 49.99
        
        sales.append({
            "date": curr_date.strftime("%Y-%m-%d"),
            "quantity": int(max(0, daily_demand)),
            "price": price,
            "is_promotion": is_promotion
        })

    # Occasional promotional spikes: random 3-5 days with 2x demand
    num_promos = random.randint(3, 5)
    promo_indices = random.sample(range(days), min(num_promos, days))
    
    for idx in promo_indices:
        sales[idx]['quantity'] = int(sales[idx]['quantity'] * 2)
        sales[idx]['is_promotion'] = True
        sales[idx]['price'] *= 0.8 # 20% discount
        
    return sales
