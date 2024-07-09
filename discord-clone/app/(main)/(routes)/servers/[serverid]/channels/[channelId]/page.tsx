import { ChatHeader } from "@/components/chat/chat-header"
import { CurrentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { redirectToSignIn } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

interface ChannelIDPageProps {
    params: {
        channelId: string
        serverId: string
    }
}

const ChannelIDPage = async ({
    params
} : ChannelIDPageProps ) => {
    const profile = await CurrentProfile();

    if(!profile){
        return redirectToSignIn();
    }

    const channel = await db.channel.findUnique({
        where: {
            id: params.channelId
        }
    })

    const member = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id
        }
    })

    if(!channel || !member){
        redirect("/")
    }

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader 
                serverId={channel.serverId}
                name={channel.name}
                type="channel"
             />
        </div>
    )
}

export default ChannelIDPage;