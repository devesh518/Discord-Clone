import { CurrentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params } : {
        params: {
            channelId: string
        }
    }
) {
    try {
        const profile = await CurrentProfile();

        const { searchParams } = new URL(req.url)
        const serverid = searchParams.get("serverid")

        if(!profile){
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if(!serverid){
            return new NextResponse("Server missing", { status: 400 })
        }

        if(!params.channelId){
            return new NextResponse("Channel does not exist", { status: 401 })
        }

        const server = await db.server.update({
            where: {
                id: serverid,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data: {
                channel: {
                    delete: {
                        id: params.channelId,
                        name: {
                            not: "general"
                        }
                    }
                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log("[CHANNEL_DELETE_ERROR]", error);
        if (isDynamicServerError(error)) {
            throw error;
        }
        return new NextResponse("Internal server error", { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params } : {
        params : {
            channelId: string
        }
    }
) {
    try{
        const profile = await CurrentProfile();

        const { searchParams } = new URL(req.url)
        const { name, type } = await req.json()
        const serverid = searchParams.get("serverid")

        if(!profile){
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if(!serverid){
            return new NextResponse("Server missing", { status: 400 })
        }

        if(!params.channelId){
            return new NextResponse("Channel missing", { status: 401 })
        }

        if(name === 'general'){
            return new NextResponse("Cannnot edit general channel", { status: 401 })
        }

        const server = await db.server.update({
            where: {
                id: serverid,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data: {
                channel: {
                    update: {
                        where: {
                            id: params.channelId,
                            name: {
                                not: "general",
                            }                    
                        },
                        data: {
                            name: name,
                            type: type,
                        }
                    }
                }
            }
        })

        return NextResponse.json(server)
    } catch(error) {
        console.log("[CHANNEL_EDIT_ERROR]", error);
        return new NextResponse("Internal server error", { status: 500 })
    }

}
