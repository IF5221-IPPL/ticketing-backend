import express, { Application } from "express";
import CONSTANT from "entity/const";
import expressLoader from "cmd/express";
import mongoLoader from "cmd/mongo";

const main = async () => {
	const app: Application = express();
	const PORT = process.env.PORT || CONSTANT.DEFAULT_PORT;

	await expressLoader(app);
	await mongoLoader();

	app.listen(PORT, () => {
		console.log(`
        ################################################
            🛡️  Server listening on port: ${PORT} 🛡️
        ################################################
      `);
	});
};

main();
