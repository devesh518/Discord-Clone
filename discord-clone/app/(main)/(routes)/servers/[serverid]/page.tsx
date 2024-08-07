import { CurrentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ServerIdPageProps{
    params: {
        serverid: string
    }
}

const ServerIdPage = async ({
    params
}: ServerIdPageProps ) => {
    const profile = await CurrentProfile();

    if(!profile){
        return redirectToSignIn()
    }

    const idofserver = params.serverid
 
    const server = await db.server.findUnique({
        where: {
            id: params.serverid,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        },
        include: {
            channel: {
                where: {
                    name: "general"
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    })
    
    if(!server) return null;
    const initialChannel = server?.channel[0]

    if(initialChannel?.name !== "general"){ 
        return null;
    }

    return redirect(`/servers/${idofserver}/channels/${initialChannel?.id}`)

}
 
export default ServerIdPage;
