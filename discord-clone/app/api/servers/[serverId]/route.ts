import { CurrentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params } : {
        params: {
            serverId: string
        }
    }
) {
    try{
        const profile = await CurrentProfile();

        const { imageUrl, name } = await req.json();

        if(!profile){
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id,
            },
            data: {
                imageUrl: imageUrl,
                name: name
            }
        })

        return NextResponse.json(server);

    } catch (error) {
        console.log("[SERVER_ID]", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function DELETE(
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

        const server = await db.server.delete({
            where: {
                id: params.serverId,
                profileId: profile.id
            }
        })

        return NextResponse.json(server)
        
    } catch (error) {
        console.log("[SERVER_DELETE_ERROR]", error);
        return new NextResponse("Internal server error", { status: 500 })
    }
}
