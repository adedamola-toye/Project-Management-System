//CRUD endpoints for users
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  password=password.trim()
  const passwordRegex =
   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>/[\]\\-])[A-Za-z\d!@#$%^&*(),.?":{}|<>/[\]\\-]{8,}$/;
  return(passwordRegex.test(password));
};


exports.createUser = async (req, res) => {
  const { username, email, password} = req.body;
  if(!password){
    return res.status(400).json({error:"Password is required"})
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and include one uppercase letter, one number, and one special character",
    });
  }

  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email=$1 OR username=$2",
      [email, username]
    );
    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this email or username already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash,created_at, updated_at, updated_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, password_hash, new Date(), new Date(), username]
    );
    res.json(newUser.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const allUsers = await pool.query(
      "SELECT id, username, email, role, created_at, updated_at FROM users"
    );
    res.json(allUsers.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    // Include updated_at in the SELECT query
    const user = await pool.query(
      "SELECT id, username, email, role, created_at, updated_at FROM users WHERE id=$1",
      [id]
    );
    if (user.rows.length > 0) {
      res.json(user.rows[0]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update User by id
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username = null, email = null, password = null, role = null } = req.body;

  try {
    const currentUser = await pool.query(
      "SELECT * FROM users WHERE id=$1", [id]
    );

    if (currentUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = currentUser.rows[0];

    const updatedData = {
      username: username === null ? user.username : username,
      email: email === null ? user.email : email,
      role: role === null ? user.role : role,
      password_hash: password ? await bcrypt.hash(password, 10) : user.password_hash,
    };

    const updateFields = [];
    const setValues = [];

    if (updatedData.username !== user.username) {
      updateFields.push('username');
      setValues.push(updatedData.username);
    }
    if (updatedData.email !== user.email) {
      updateFields.push('email');
      setValues.push(updatedData.email);
    }
    if (updatedData.role !== user.role) {
      updateFields.push('role');
      setValues.push(updatedData.role);
    }
    if (updatedData.password_hash !== user.password_hash) {
      updateFields.push('password_hash');
      setValues.push(updatedData.password_hash);
    }
    updateFields.push('updated_at');
    setValues.push(new Date());

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    let updateQuery = "UPDATE users SET ";
    updateQuery += updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    console.log("Update Query:", updateQuery);
    console.log("Set Values:", setValues);

    updateQuery += " WHERE id = $" + (updateFields.length + 1);
    setValues.push(id);

    console.log("Final Set Values with ID:", setValues);

    const updatedUser = await pool.query(updateQuery, setValues);

    res.json(updatedUser.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



//Delete User by id
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await pool.query(
      "DELETE FROM users WHERE id=$1 RETURNING *",
      [id]
    );
    if (deletedUser.rows.length > 0) {
      res.json({ message: `User ${id} deleted` });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
