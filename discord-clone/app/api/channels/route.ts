import { CurrentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
) {
    try {
        const profile = await CurrentProfile();

        const { searchParams } = new URL(req.url)
        const { name, type } = await req.json()
        const serverid = searchParams.get("serverid")
        const serverId = searchParams.get("serverId")
        console.log(req.url)
        console.log(serverid)
        console.log("Use this \n")
        console.log(serverId)

        if(!profile){
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if(!serverId){
            console.log("This is giving 400 error")
            return new NextResponse("Server ID missing", { status: 400 })
        }

        if(name === 'general'){
            return new NextResponse("Only one general channel is allowed", { status: 401})
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    },
                }
            },
            data: {
                channel: {
                    create: {
                        profileId: profile.id,
                        name,
                        type,
                    }
                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log("[CHANNEL_ERROR]", error);
        return new NextResponse("Internal server error", { status: 500 })
    }
}
