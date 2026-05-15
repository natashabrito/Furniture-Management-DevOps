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


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )