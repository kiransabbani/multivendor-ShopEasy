from forecasting.exponential_smoothing import forecast as forecast_es
from forecasting.lstm_model import forecast as forecast_lstm
import logging

def run_forecast(product_id: str, sales_history: list, horizon_days: int=30) -> dict:
    if not sales_history:
        raise ValueError("sales_history cannot be empty")
        
    data_length = len(sales_history)
    
    if data_length >= 30:
        try:
            result = forecast_lstm(sales_history, horizon_days)
            result['algorithm'] = 'lstm'
            result['product_id'] = product_id
            return result
        except Exception as e:
            logging.error(f"LSTM forecast failed for {product_id}: {e}. Falling back to Exponential Smoothing.")
            
    # Fallback or data length < 30
    result = forecast_es(sales_history, horizon_days)
    result['algorithm'] = 'exponential_smoothing'
    result['product_id'] = product_id
    
    return result
