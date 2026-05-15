CREATE DATABASE IF NOT EXISTS FurnitureDB;

USE FurnitureDB;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

INSERT INTO users (username, password) VALUES
('admin', 'admin123'),
('staff', 'staff@123'),
('manager', 'manager123'),
('employee1', 'emp@001'),
('employee2', 'emp@002'),
('guest', 'guest123'),
('warehouse', 'store@456'),
('support', 'helpdesk!321');

CREATE TABLE IF NOT EXISTS furniture (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL
);

INSERT INTO furniture (name, category, price, quantity) VALUES
('Wooden Chair', 'Chair', 1500.00, 10),
('Office Desk', 'Table', 4500.00, 5),
('Sofa Set', 'Seating', 12000.00, 2),
('Bookshelf', 'Storage', 3500.00, 4),
('Dining Table', 'Table', 8000.00, 3),
('Recliner Chair', 'Seating', 7500.00, 3),
('Glass Coffee Table', 'Table', 3200.00, 6),
('TV Unit', 'Storage', 9000.00, 2),
('Study Table', 'Table', 4100.00, 5),
('Queen Bed', 'Bed', 15000.00, 2),
('Wardrobe', 'Storage', 12500.00, 3),
('Office Chair', 'Chair', 2800.00, 10),
('Shoe Rack', 'Storage', 1800.00, 8),
('Bookshelf XL', 'Storage', 5000.00, 4),
('Folded Dining Table', 'Table', 7200.00, 2),
('L-Shaped Sofa', 'Seating', 22000.00, 1),
('Bunk Bed', 'Bed', 17000.00, 2),
('Whiteboard', 'Classroom', 15000.00, 7);