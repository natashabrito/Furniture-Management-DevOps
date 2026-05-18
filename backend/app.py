from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import time

app = Flask(__name__)
CORS(app)


def get_db_connection():

    for i in range(20):

        try:

            connection = pymysql.connect(
                host="mysql",
                user="root",
                password="root",
                database="FurnitureDB",
                charset="utf8mb4"
            )

            print("MySQL Connected Successfully")

            return connection

        except Exception as e:

            print(f"MySQL connection failed. Retrying... {e}", flush=True)

            time.sleep(5)

    return None


@app.route("/furniture", methods=["GET"])
def get_furniture():

    db = get_db_connection()

    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = db.cursor(pymysql.cursors.DictCursor)

    cursor.execute("SELECT * FROM furniture")

    data = cursor.fetchall()

    db.close()

    return jsonify(data)


@app.route("/login", methods=["POST"])
def login():

    data = request.json

    db = get_db_connection()

    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = db.cursor(pymysql.cursors.DictCursor)

    sql = "SELECT * FROM users WHERE username=%s AND password=%s"

    cursor.execute(
        sql,
        (data["username"], data["password"])
    )

    user = cursor.fetchone()

    db.close()

    if user:
        return jsonify({"success": True})

    return jsonify({"success": False})


@app.route("/furniture", methods=["POST"])
def add_furniture():

    data = request.json

    db = get_db_connection()

    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = db.cursor()

    sql = """
    INSERT INTO furniture(name, category, price, quantity)
    VALUES(%s,%s,%s,%s)
    """

    values = (
        data["name"],
        data["category"],
        data["price"],
        data["quantity"]
    )

    cursor.execute(sql, values)

    db.commit()

    db.close()

    return jsonify({"message": "Furniture added successfully"})


@app.route("/furniture/<int:id>", methods=["PUT"])
def update_furniture(id):

    data = request.json

    db = get_db_connection()

    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = db.cursor()

    sql = """
    UPDATE furniture
    SET name=%s, category=%s, price=%s, quantity=%s
    WHERE id=%s
    """

    values = (
        data["name"],
        data["category"],
        data["price"],
        data["quantity"],
        id
    )

    cursor.execute(sql, values)

    db.commit()

    db.close()

    return jsonify({"message": "Furniture updated successfully"})


@app.route("/furniture/<int:id>", methods=["DELETE"])
def delete_furniture(id):

    db = get_db_connection()

    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = db.cursor()

    cursor.execute(
        "DELETE FROM furniture WHERE id=%s",
        (id,)
    )

    db.commit()

    db.close()

    return jsonify({"message": "Furniture deleted successfully"})


@app.route("/orders", methods=["GET"])
def get_orders():
    db = get_db_connection()
    if db is None: return jsonify({"error": "DB failed"}), 500
    cursor = db.cursor(pymysql.cursors.DictCursor)
    
    # Join with furniture to get the item name
    sql = """
    SELECT o.id, o.furniture_id, o.user_name, o.status, o.order_date, f.name as furniture_name 
    FROM orders o 
    JOIN furniture f ON o.furniture_id = f.id
    ORDER BY o.order_date DESC
    """
    cursor.execute(sql)
    data = cursor.fetchall()
    db.close()
    return jsonify(data)


@app.route("/orders", methods=["POST"])
def create_order():
    data = request.json
    db = get_db_connection()
    if db is None: return jsonify({"error": "DB failed"}), 500
    cursor = db.cursor()
    
    # 1. Create the order
    sql_order = "INSERT INTO orders(furniture_id, user_name) VALUES(%s, %s)"
    cursor.execute(sql_order, (data["furniture_id"], data["user_name"]))
    
    # 2. Decrease the quantity in furniture table
    sql_update = "UPDATE furniture SET quantity = quantity - 1 WHERE id = %s AND quantity > 0"
    cursor.execute(sql_update, (data["furniture_id"],))
    
    db.commit()
    db.close()
    return jsonify({"message": "Order created successfully"})


@app.route("/orders/<int:id>/status", methods=["PUT"])
def update_order_status(id):
    data = request.json
    db = get_db_connection()
    if db is None: return jsonify({"error": "DB failed"}), 500
    cursor = db.cursor()
    
    sql = "UPDATE orders SET status=%s WHERE id=%s"
    cursor.execute(sql, (data["status"], id))
    
    db.commit()
    db.close()
    return jsonify({"message": "Order status updated"})


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )