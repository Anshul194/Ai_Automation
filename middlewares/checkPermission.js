import Admin from '../models/admin.js';
import Role from '../models/Role.js';


// Permission middleware: checks if admin has permission for a module and CRUD type
function checkPermission(moduleName, crudType) {
  return async (req, res, next) => {

    const adminId = req.session?.adminId || req.user?.id || req.user?._id;
    if (!adminId) return res.status(403).send('Admin not authenticated');
    console?.log("Admin ID:", adminId);
    let admin;
     admin = await Admin.findById(adminId).populate('role');
    
    console?.log("Admin fetched for permission check:", admin);

    if (!admin || !admin.role) return res.status(403).send('No role assigned');

    const permissions = admin.role === "Garba Class"
      ? admin.roleId?.permissions
      : admin.role?.permissions;
    console?.log("Admin permissions:", permissions);
    console?.log("Module name:", moduleName, "CRUD type:", crudType);
    const modulePerm = permissions.find(p => p.module == moduleName);
console.log("Checking permissions for module:", moduleName, "and CRUD type:", crudType ,modulePerm);
    if (modulePerm && modulePerm[crudType]) {
      return next();
    } else {
      return res.status(403).send(`Permission denied: ${crudType.toUpperCase()} on ${moduleName}`);
    }
  };
}

export default checkPermission;
