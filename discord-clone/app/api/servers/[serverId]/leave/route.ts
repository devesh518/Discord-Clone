import { CurrentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params } : {
        params : {
            serverId: string
        }
    }
) {
    try {
        const profile = await CurrentProfile();

        if(!profile){
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if(!params.serverId){
            return new NextResponse("Missing server", { status: 401 })
        }

        const member = await db.member.findFirst({
            where: {
                profileId: profile.id,
                serverId: params.serverId
            }
        })

        if(!member){
            return new NextResponse("Member does not exist", { status: 401 })
        }

        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: {
                    not: profile.id
                },
            },
            data: {
                members: {
                    delete: {
                        id: member.id,
                    }
                }
            },
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log("[MEMBER_LEAVE_ERROR]", error);
        return new NextResponse("Internal server error", { status: 500 })
    }
}