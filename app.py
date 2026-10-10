import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import date, datetime
from dotenv import load_dotenv

load_dotenv()

portal_app = Flask(__name__, static_folder="frontend", static_url_path="")
CORS(portal_app)

db_settings = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "user":     os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "research_portal")
}

ALLOWED_STATUS_VALUES = ("Open", "Closed")


def open_db_connection():
    try:
        connection = mysql.connector.connect(**db_settings)
        return connection
    except Error as db_err:
        print(f"Database connection error: {db_err}")
        return None


def check_request_data(payload):
    mandatory_fields = [
        "title", "description", "research_area",
        "faculty_name", "department", "required_skills",
        "available_positions", "deadline"
    ]

    for field_name in mandatory_fields:
        if field_name not in payload or str(payload[field_name]).strip() == "":
            return f"'{field_name}' is required and cannot be empty."

    try:
        if int(payload["available_positions"]) <= 0:
            return "'available_positions' must be a positive number."
    except (ValueError, TypeError):
        return "'available_positions' must be a valid number."

    try:
        datetime.strptime(str(payload["deadline"]), "%Y-%m-%d")
    except (ValueError, TypeError):
        return "'deadline' must be a valid date in YYYY-MM-DD format."

    current_status = payload.get("status", "Open")
    if current_status not in ALLOWED_STATUS_VALUES:
        return f"'status' must be one of: {', '.join(ALLOWED_STATUS_VALUES)}."

    return None


@portal_app.route("/")
@portal_app.route("/portal")
@portal_app.route("/welcome")
def show_home_page():
    return portal_app.send_static_file("index.html")


@portal_app.route("/api/opportunities", methods=["POST"])
def add_opportunity():
    payload = request.get_json()

    if not payload:
        return jsonify({"error": "Request body must be JSON."}), 400

    validation_error = check_request_data(payload)
    if validation_error:
        return jsonify({"error": validation_error}), 400

    db_conn = open_db_connection()
    if not db_conn:
        return jsonify({"error": "Could not connect to database."}), 500

    try:
        db_cursor = db_conn.cursor()
        insert_query = """
            INSERT INTO research_opportunities
                (title, description, research_area, faculty_name,
                 department, required_skills, available_positions, deadline, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        query_values = (
            payload["title"],
            payload["description"],
            payload["research_area"],
            payload["faculty_name"],
            payload["department"],
            payload["required_skills"],
            int(payload["available_positions"]),
            payload["deadline"],
            payload.get("status", "Open")
        )
        db_cursor.execute(insert_query, query_values)
        db_conn.commit()

        return jsonify({
            "message": "Research opportunity created successfully.",
            "id": db_cursor.lastrowid
        }), 201

    except Error as db_err:
        return jsonify({"error": str(db_err)}), 500

    finally:
        db_cursor.close()
        db_conn.close()


@portal_app.route("/api/opportunities", methods=["GET"])
def list_opportunities():
    db_conn = open_db_connection()
    if not db_conn:
        return jsonify({"error": "Could not connect to database."}), 500

    try:
        db_cursor = db_conn.cursor(dictionary=True)
        db_cursor.execute("SELECT * FROM research_opportunities")
        all_records = db_cursor.fetchall()

        for record in all_records:
            if isinstance(record.get("deadline"), date):
                record["deadline"] = record["deadline"].isoformat()

        return jsonify(all_records), 200

    except Error as db_err:
        return jsonify({"error": str(db_err)}), 500

    finally:
        db_cursor.close()
        db_conn.close()


@portal_app.route("/api/opportunities/<int:opportunity_id>", methods=["GET"])
def fetch_single_opportunity(opportunity_id):
    db_conn = open_db_connection()
    if not db_conn:
        return jsonify({"error": "Could not connect to database."}), 500

    try:
        db_cursor = db_conn.cursor(dictionary=True)
        db_cursor.execute(
            "SELECT * FROM research_opportunities WHERE id = %s", (opportunity_id,)
        )
        record = db_cursor.fetchone()

        if not record:
            return jsonify({"error": f"No opportunity found with ID {opportunity_id}."}), 404

        if isinstance(record.get("deadline"), date):
            record["deadline"] = record["deadline"].isoformat()

        return jsonify(record), 200

    except Error as db_err:
        return jsonify({"error": str(db_err)}), 500

    finally:
        db_cursor.close()
        db_conn.close()


@portal_app.route("/api/opportunities/<int:opportunity_id>", methods=["PUT"])
def edit_opportunity(opportunity_id):
    payload = request.get_json()

    if not payload:
        return jsonify({"error": "Request body must be JSON."}), 400

    validation_error = check_request_data(payload)
    if validation_error:
        return jsonify({"error": validation_error}), 400

    db_conn = open_db_connection()
    if not db_conn:
        return jsonify({"error": "Could not connect to database."}), 500

    try:
        db_cursor = db_conn.cursor()

        db_cursor.execute(
            "SELECT id FROM research_opportunities WHERE id = %s", (opportunity_id,)
        )
        if not db_cursor.fetchone():
            return jsonify({"error": f"No opportunity found with ID {opportunity_id}."}), 404

        update_query = """
            UPDATE research_opportunities
            SET title = %s, description = %s, research_area = %s,
                faculty_name = %s, department = %s, required_skills = %s,
                available_positions = %s, deadline = %s, status = %s
            WHERE id = %s
        """
        query_values = (
            payload["title"],
            payload["description"],
            payload["research_area"],
            payload["faculty_name"],
            payload["department"],
            payload["required_skills"],
            int(payload["available_positions"]),
            payload["deadline"],
            payload.get("status", "Open"),
            opportunity_id
        )
        db_cursor.execute(update_query, query_values)
        db_conn.commit()

        return jsonify({"message": f"Opportunity {opportunity_id} updated successfully."}), 200

    except Error as db_err:
        return jsonify({"error": str(db_err)}), 500

    finally:
        db_cursor.close()
        db_conn.close()


@portal_app.route("/api/opportunities/<int:opportunity_id>", methods=["DELETE"])
def remove_opportunity(opportunity_id):
    db_conn = open_db_connection()
    if not db_conn:
        return jsonify({"error": "Could not connect to database."}), 500

    try:
        db_cursor = db_conn.cursor()

        db_cursor.execute(
            "SELECT id FROM research_opportunities WHERE id = %s", (opportunity_id,)
        )
        if not db_cursor.fetchone():
            return jsonify({"error": f"No opportunity found with ID {opportunity_id}."}), 404

        db_cursor.execute(
            "DELETE FROM research_opportunities WHERE id = %s", (opportunity_id,)
        )
        db_conn.commit()

        return jsonify({"message": f"Opportunity {opportunity_id} deleted successfully."}), 200

    except Error as db_err:
        return jsonify({"error": str(db_err)}), 500

    finally:
        db_cursor.close()
        db_conn.close()


if __name__ == "__main__":
    portal_app.run(debug=True)
