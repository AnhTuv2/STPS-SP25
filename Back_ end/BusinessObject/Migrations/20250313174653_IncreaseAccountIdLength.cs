using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessObject.Migrations
{
    /// <inheritdoc />
    public partial class IncreaseAccountIdLength : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Authentication",
                columns: table => new
                {
                    authenticationID = table.Column<int>(type: "int", nullable: false),
                    authenticationName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Authentication", x => x.authenticationID);
                });

            migrationBuilder.CreateTable(
                name: "LocationType",
                columns: table => new
                {
                    typeID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    typeName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocationType", x => x.typeID);
                });

            migrationBuilder.CreateTable(
                name: "Tour",
                columns: table => new
                {
                    tourID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    tourName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tour", x => x.tourID);
                });

            migrationBuilder.CreateTable(
                name: "Account",
                columns: table => new
                {
                    accountID = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    username = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    auID = table.Column<int>(type: "int", nullable: false),
                    password = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    status = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Account", x => x.accountID);
                    table.ForeignKey(
                        name: "FK_Account_Authentication",
                        column: x => x.auID,
                        principalTable: "Authentication",
                        principalColumn: "authenticationID");
                });

            migrationBuilder.CreateTable(
                name: "Location",
                columns: table => new
                {
                    locationID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    typeID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    locationName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    price = table.Column<double>(type: "float", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Location", x => x.locationID);
                    table.ForeignKey(
                        name: "FK_Location_LocationType",
                        column: x => x.typeID,
                        principalTable: "LocationType",
                        principalColumn: "typeID");
                });

            migrationBuilder.CreateTable(
                name: "AccountDetail",
                columns: table => new
                {
                    accountID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    email = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    avatar = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.ForeignKey(
                        name: "FK_AccountDetail_Account",
                        column: x => x.accountID,
                        principalTable: "Account",
                        principalColumn: "accountID");
                });

            migrationBuilder.CreateTable(
                name: "Order",
                columns: table => new
                {
                    orderID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    accountID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    tourID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    startDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    status = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Order", x => x.orderID);
                    table.ForeignKey(
                        name: "FK_Order_Account",
                        column: x => x.accountID,
                        principalTable: "Account",
                        principalColumn: "accountID");
                    table.ForeignKey(
                        name: "FK_Order_Tour",
                        column: x => x.tourID,
                        principalTable: "Tour",
                        principalColumn: "tourID");
                });

            migrationBuilder.CreateTable(
                name: "TourFeedback",
                columns: table => new
                {
                    feedbackID = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    accountID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    tourID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    rating = table.Column<int>(type: "int", nullable: true),
                    feedbackDetail = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TourFeedback", x => x.feedbackID);
                    table.ForeignKey(
                        name: "FK_TourFeedback_Account",
                        column: x => x.accountID,
                        principalTable: "Account",
                        principalColumn: "accountID");
                    table.ForeignKey(
                        name: "FK_TourFeedback_Tour",
                        column: x => x.tourID,
                        principalTable: "Tour",
                        principalColumn: "tourID");
                });

            migrationBuilder.CreateTable(
                name: "TourismCompany",
                columns: table => new
                {
                    tcID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    accountID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    tcName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TourismCompany", x => x.tcID);
                    table.ForeignKey(
                        name: "FK_TourismCompany_Account",
                        column: x => x.accountID,
                        principalTable: "Account",
                        principalColumn: "accountID");
                });

            migrationBuilder.CreateTable(
                name: "TourDetail",
                columns: table => new
                {
                    tourID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    locationID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    rollno = table.Column<int>(type: "int", nullable: false),
                    startTime = table.Column<DateTime>(type: "datetime", nullable: false),
                    endTime = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.ForeignKey(
                        name: "FK_TourDetail_Location",
                        column: x => x.locationID,
                        principalTable: "Location",
                        principalColumn: "locationID");
                    table.ForeignKey(
                        name: "FK_TourDetail_Tour",
                        column: x => x.tourID,
                        principalTable: "Tour",
                        principalColumn: "tourID");
                });

            migrationBuilder.CreateTable(
                name: "TCTour",
                columns: table => new
                {
                    tourID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    tcID = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    price = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.ForeignKey(
                        name: "FK_TCTour_Tour",
                        column: x => x.tourID,
                        principalTable: "Tour",
                        principalColumn: "tourID");
                    table.ForeignKey(
                        name: "FK_TCTour_TourismCompany",
                        column: x => x.tcID,
                        principalTable: "TourismCompany",
                        principalColumn: "tcID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Account_auID",
                table: "Account",
                column: "auID");

            migrationBuilder.CreateIndex(
                name: "UK_Table_1",
                table: "Account",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AccountDetail_accountID",
                table: "AccountDetail",
                column: "accountID");

            migrationBuilder.CreateIndex(
                name: "IX_Location_typeID",
                table: "Location",
                column: "typeID");

            migrationBuilder.CreateIndex(
                name: "IX_Order_accountID",
                table: "Order",
                column: "accountID");

            migrationBuilder.CreateIndex(
                name: "IX_Order_tourID",
                table: "Order",
                column: "tourID");

            migrationBuilder.CreateIndex(
                name: "IX_TCTour_tcID",
                table: "TCTour",
                column: "tcID");

            migrationBuilder.CreateIndex(
                name: "IX_TCTour_tourID",
                table: "TCTour",
                column: "tourID");

            migrationBuilder.CreateIndex(
                name: "IX_TourDetail_locationID",
                table: "TourDetail",
                column: "locationID");

            migrationBuilder.CreateIndex(
                name: "IX_TourDetail_tourID",
                table: "TourDetail",
                column: "tourID");

            migrationBuilder.CreateIndex(
                name: "IX_TourFeedback_accountID",
                table: "TourFeedback",
                column: "accountID");

            migrationBuilder.CreateIndex(
                name: "IX_TourFeedback_tourID",
                table: "TourFeedback",
                column: "tourID");

            migrationBuilder.CreateIndex(
                name: "IX_TourismCompany_accountID",
                table: "TourismCompany",
                column: "accountID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountDetail");

            migrationBuilder.DropTable(
                name: "Order");

            migrationBuilder.DropTable(
                name: "TCTour");

            migrationBuilder.DropTable(
                name: "TourDetail");

            migrationBuilder.DropTable(
                name: "TourFeedback");

            migrationBuilder.DropTable(
                name: "TourismCompany");

            migrationBuilder.DropTable(
                name: "Location");

            migrationBuilder.DropTable(
                name: "Tour");

            migrationBuilder.DropTable(
                name: "Account");

            migrationBuilder.DropTable(
                name: "LocationType");

            migrationBuilder.DropTable(
                name: "Authentication");
        }
    }
}
