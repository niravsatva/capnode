"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../client/prisma");
class InviteRepository {
    create(invitedBy, invitedTo, role, company, companyRole) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const invite = yield prisma_1.prisma.invitations.create({
                    data: {
                        invitedBy: { connect: { id: invitedBy } },
                        invitedTo: { connect: { id: invitedTo } },
                        role: { connect: { id: role } },
                        company: { connect: { id: company } },
                        companyRole: { connect: { id: companyRole } },
                        invitationStatus: 'Pending',
                    },
                });
                return invite;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new InviteRepository();
