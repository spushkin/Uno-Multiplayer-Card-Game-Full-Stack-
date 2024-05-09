"use strict";

const { STRING, DATE, INTEGER } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("users", {
			id: {
				type: INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			username: {
				type: STRING,
				allowNull: false,
			},
			password: {
				type: STRING,
				allowNull: false,
			},
			created_at: {
				type: DATE,
				defaultValue: Sequelize.literal("NOW()"),
				allowNull: false,
			},
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("users");
	},
};
