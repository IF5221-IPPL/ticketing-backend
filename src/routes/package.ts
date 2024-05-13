import CONSTANT from "entity/const/";
import express from "express";
import { createPackage } from "handler/create_package/";
import { getPackages } from "handler/get_packages/";
import { deletePackage } from "handler/delete_packages/";
import { auth } from "middleware/auth/";
import { checkRole } from "middleware/check_role/";

const router = express.Router();

router.post(
    "/packages",
    auth,
    checkRole(CONSTANT.ROLE.ADMIN),
    createPackage    
);

router.get(
    "/packages",
    auth,
    checkRole(CONSTANT.ROLE.EO),
    getPackages    
);

router.delete(
    "/packages/:packageId",
    auth,
    checkRole(CONSTANT.ROLE.ADMIN),
    deletePackage
);

export default router;
