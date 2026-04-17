
const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.role === 'DOCTOR') {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
      
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      return res.json({
        token,
        user: { id: user.id, name: user.name, role: user.role }
      });
    }

    return res.status(401).json({ message: 'User not found or unhandled role' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
