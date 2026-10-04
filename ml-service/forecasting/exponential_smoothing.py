import numpy as np
import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from datetime import timedelta

def calculate_trend(data_values):
    if len(data_values) < 14:
        return "stable"
    first_7 = np.mean(data_values[:7])
    last_7 = np.mean(data_values[-7:])
    if first_7 == 0:
        return "up" if last_7 > 0 else "stable"
    diff = (last_7 - first_7) / first_7
    if diff > 0.05:
        return "up"
    elif diff < -0.05:
        return "down"
    else:
        return "stable"

def mean_absolute_percentage_error(y_true, y_pred):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    non_zero = y_true != 0
    if not np.any(non_zero):
        return 0
    return np.mean(np.abs((y_true[non_zero] - y_pred[non_zero]) / y_true[non_zero]))

def forecast(sales_data, horizon):
    df = pd.DataFrame(sales_data)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    
    values = df['quantity'].values
    
    trend_val = calculate_trend(values)
    
    if len(values) < 7:
        # Simple moving average fallback
        avg = np.mean(values) if len(values) > 0 else 0
        forecast_values = [avg] * horizon
        accuracy = 0.0 # Cannot calculate properly
        ci_lower = [max(0, avg * 0.85)] * horizon
        ci_upper = [avg * 1.15] * horizon
    else:
        # Train/holdout split for accuracy (last 20%)
        split_idx = int(len(values) * 0.8)
        train_vals = values[:split_idx]
        test_vals = values[split_idx:]
        
        # Train for accuracy
        try:
            model = ExponentialSmoothing(train_vals, trend='add', seasonal=None, initialization_method="estimated")
            fit_model = model.fit(smoothing_level=0.3, smoothing_trend=0.1)
            pred_test = fit_model.forecast(len(test_vals))
            mape = mean_absolute_percentage_error(test_vals, pred_test)
            accuracy = max(0, 1 - mape)
        except:
            accuracy = 0.5
            
        # Fit on full data for actual forecasting
        try:
            full_model = ExponentialSmoothing(values, trend='add', seasonal=None, initialization_method="estimated")
            full_fit = full_model.fit(smoothing_level=0.3, smoothing_trend=0.1)
            forecast_values = full_fit.forecast(horizon)
        except:
            avg = np.mean(values)
            forecast_values = [avg] * horizon

        ci_lower = []
        ci_upper = []
        for i, val in enumerate(forecast_values):
            variance = 0.15 if i < horizon / 2 else 0.25
            ci_lower.append(max(0, val * (1 - variance)))
            ci_upper.append(val * (1 + variance))

    # Format output
    last_date = df['date'].iloc[-1]
    daily_forecasts = []
    for i in range(horizon):
        fc_date = last_date + timedelta(days=i+1)
        pred = forecast_values[i]
        daily_forecasts.append({
            "date": fc_date.strftime("%Y-%m-%d"),
            "predicted": float(pred),
            "confidence": float(accuracy)
        })
    
    avg_daily_demand = float(np.mean(forecast_values))
    weekly_forecast = float(avg_daily_demand * 7)
    monthly_forecast = float(avg_daily_demand * 30)

    return {
        "daily_forecasts": daily_forecasts,
        "weekly_forecast": weekly_forecast,
        "monthly_forecast": monthly_forecast,
        "avg_daily_demand": avg_daily_demand,
        "trend": trend_val,
        "accuracy": float(accuracy),
        "confidence_interval": {
            "lower": [float(v) for v in ci_lower],
            "upper": [float(v) for v in ci_upper]
        }
    }
