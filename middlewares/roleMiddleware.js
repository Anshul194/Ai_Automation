import Role from '../models/Role.js';

export async function isAdmin(req, res, next) {
  try {
    console.log("User from JWT:", req.user);

    if (!req.user || !req.user.roles) {
      console.log("No user or roles found in req.user");
      return res.status(403).json({ message: 'Access denied, no user or roles provided.' });
    }

    let roleDoc = null;

    // Handle different formats of req.user.roles
    if (Array.isArray(req.user.roles)) {
      // Case 1: roles is an array (e.g., ["Super Admin"] or [{name: "Super Admin"}])
      const adminRole = req.user.roles.find(
        (role) =>
          (typeof role === 'string' && role === 'Super Admin') ||
          (typeof role === 'object' && role.name === 'Super Admin')
      );
      if (adminRole) {
        roleDoc = typeof adminRole === 'object' ? adminRole : await Role.findOne({ name: adminRole });
      }
    } else if (typeof req.user.roles === 'string') {
      // Case 2: roles is a string (e.g., "Super Admin" or role ID)
      if (req.user.roles === 'Super Admin') {
        roleDoc = await Role.findOne({ name: 'Super Admin' });
      } else {
        // Assume it's a role ID
        roleDoc = await Role.findById(req.user.roles);
      }
    } else if (typeof req.user.roles === 'object' && req.user.roles.name) {
      // Case 3: roles is an object with a name property
      roleDoc = req.user.roles;
    }

    console.log("Role Document Found:", roleDoc);

    // Check if roleDoc exists and has the name "Super Admin"
    if (roleDoc && roleDoc.name === 'Super Admin') {
      console.log("Admin access granted for role:", roleDoc.name);
      return next();
    }

    console.log("Admin access denied, role not Super Admin or not found");
    return res.status(403).json({ message: 'Access denied, admin only.' });
  } catch (err) {
    console.error("Error in isAdmin middleware:", err.message);
    return res.status(500).json({ message: 'Server error in isAdmin middleware.', error: err.message });
  }
}
