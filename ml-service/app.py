import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from forecasting.forecast_engine import run_forecast

app = Flask(__name__)
allowed_origins = [origin.strip() for origin in os.environ.get('FRONTEND_URL', '').split(',') if origin.strip()]
CORS(app, origins=allowed_origins or ['http://localhost:5173'])

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/forecast', methods=['POST'])
def forecast():
    try:
        expected_key = os.environ.get('ML_SERVICE_API_KEY')
        if expected_key and request.headers.get('X-ML-Service-Key') != expected_key:
            return jsonify({"error": "Unauthorized"}), 401
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400
        
        product_id = data.get('product_id')
        sales_history = data.get('sales_history', [])
        horizon_days = data.get('horizon_days', 30)

        if not product_id or not sales_history:
            return jsonify({"error": "product_id and sales_history are required"}), 400

        result = run_forecast(product_id, sales_history, horizon_days)
        return jsonify(result), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        app.logger.exception("Forecast request failed")
        return jsonify({"error": "Forecasting failed"}), 500

@app.route('/forecast/batch', methods=['POST'])
def forecast_batch():
    try:
        expected_key = os.environ.get('ML_SERVICE_API_KEY')
        if expected_key and request.headers.get('X-ML-Service-Key') != expected_key:
            return jsonify({"error": "Unauthorized"}), 401
        data = request.get_json()
        if not data or not isinstance(data, list):
            return jsonify({"error": "Expected a list of forecasting requests"}), 400

        results = []
        for req in data:
            product_id = req.get('product_id')
            sales_history = req.get('sales_history', [])
            horizon_days = req.get('horizon_days', 30)
            
            if not product_id or not sales_history:
                results.append({"error": "product_id and sales_history are required"})
                continue
                
            try:
                result = run_forecast(product_id, sales_history, horizon_days)
                results.append(result)
            except Exception as e:
                results.append({"product_id": product_id, "error": str(e)})

        return jsonify(results), 200

    except Exception:
        app.logger.exception("Batch forecast request failed")
        return jsonify({"error": "Forecasting failed"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', '').lower() == 'true')
