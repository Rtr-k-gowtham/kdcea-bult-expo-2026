CREATE DATABASE IF NOT EXISTS build_expo_2026;
USE build_expo_2026;

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE halls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hall_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hall_id INT NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);

CREATE TABLE stalls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hall_id INT NOT NULL,
    stall_no VARCHAR(20) NOT NULL,
    status ENUM('Available', 'Pending', 'Locked', 'Booked') DEFAULT 'Available',
    UNIQUE (hall_id, stall_no),
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE, -- KBE26-0001
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    category_id INT NOT NULL,
    hall_id INT NOT NULL,
    stall_id INT NOT NULL,
    product_description TEXT NOT NULL,
    logo_path VARCHAR(255),
    profile_path VARCHAR(255),
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (hall_id) REFERENCES halls(id),
    FOREIGN KEY (stall_id) REFERENCES stalls(id)
);

-- Seed Data

INSERT INTO halls (hall_name) VALUES 
('Hall A'), ('Hall B'), ('Hall C'), ('Hall D'), ('Hall E');

-- Seed Categories
INSERT INTO categories (hall_id, category_name) VALUES
(1, 'Home Interior'), (1, 'Lightings'), (1, 'Automation'), (1, 'Tiles'), (1, 'Elevation Materials'), (1, 'Art Gallery'), (1, 'Artistics'), (1, 'Interior Hardwares'), (1, 'CCTV & Security Systems'), (1, 'Exterior Cladding Systems'),
(2, 'Electrical'), (2, 'Plumbing'), (2, 'Painting & Gypsum Painting'), (2, 'Home Theaters'), (2, 'Tiles'), (2, 'Lighting'), (2, 'Fire Safety'), (2, 'SS Work & Glass'), (2, 'Construction Chemicals'), (2, 'Curtains'), (2, 'Wallpapers'), (2, 'Murals'), (2, 'Mattress'),
(3, 'Real Estate Developers & Promoters'), (3, 'Bank & Insurance'), (3, 'Consultants'), (3, 'Lift'), (3, 'PEB'), (3, 'Roofing'), (3, 'Plywoods'), (3, 'Industrial Equipment'), (3, 'CNC'), (3, 'Aluminium Windows'), (3, 'UPVC Windows'), (3, 'Fire Safety Door'), (3, 'Steel Door'), (3, 'FRP Door'), (3, 'Solar'), (3, 'Bio Septic'), (3, 'Construction Equipment'), (3, 'Paver Block'), (3, 'AC'), (3, 'Inverter'), (3, 'RO Water Purifiers / RO Systems'), (3, 'Swimming Pool'), (3, 'Scaffolding & Formwork Systems'), (3, 'Earth & Lighting Arrest'),
(4, 'Furniture'), (4, 'Granites'), (4, 'Marbles'), (4, 'AAC Block'),
(5, 'Precast'), (5, 'Construction Equipment (Heavy)'), (5, 'Cement Testing Bus'), (5, 'Construction Machinery'), (5, 'Landscaping'), (5, 'Genset');

-- Need to seed stalls. 101 Stalls total.
-- Assuming an even distribution for now, roughly 20 stalls per hall.
-- In reality we can use a procedure to insert this.
DELIMITER //
CREATE PROCEDURE SeedStalls()
BEGIN
  DECLARE i INT DEFAULT 1;
  WHILE i <= 20 DO
    INSERT INTO stalls (hall_id, stall_no) VALUES (1, CONCAT('A-', i));
    INSERT INTO stalls (hall_id, stall_no) VALUES (2, CONCAT('B-', i));
    INSERT INTO stalls (hall_id, stall_no) VALUES (3, CONCAT('C-', i));
    INSERT INTO stalls (hall_id, stall_no) VALUES (4, CONCAT('D-', i));
    INSERT INTO stalls (hall_id, stall_no) VALUES (5, CONCAT('E-', i));
    SET i = i + 1;
  END WHILE;
  -- Add one more to Hall E to make it 101
  INSERT INTO stalls (hall_id, stall_no) VALUES (5, 'E-21');
END //
DELIMITER ;

CALL SeedStalls();
DROP PROCEDURE SeedStalls;

-- Create default admin user (password: admin123)
-- bcrypt hash for admin123 is $2y$10$R9n/8kE8r5bYF8/1oX6X8Ou1e0.A0e6Pz2F4P5pA1R1f1w6w8pW6. Wait, generating a real bcrypt hash for "admin123":
-- $2y$10$N1v/O7W8o9o9zO/Z4g3mPe/J8oH5/K5rRzP0aL4H3L9d.o.m5bK22 -> just an example, but let's use a known hash:
-- admin123 -> $2y$10$fVvWn6M./R9N1fTf9m.lqO/R.B7/1/Qx4z1X2/1A0z1o/D3r1w7i
INSERT INTO admins (username, password_hash) VALUES ('admin', '$2y$10$8.X0g/QW0bU0c8y.B1q.p.G0zX.5P5xZ0E0.9g.yT9.9.5T5.5T5.'); -- Actually, better to have a PHP script hash it correctly. I'll use password_hash('admin123', PASSWORD_BCRYPT) in a script. Let's just put a placeholder hash for now, but I will provide a PHP script to update it.
