import { CurrentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ChannelType } from "@prisma/client";
import { ServerHeader } from "./server-header";

interface ServerSidebarProps{
    serverId: string
}

export const ServerSidebar = async ({
    serverId
}: ServerSidebarProps) => {
    const profile = await CurrentProfile();

    if(!profile){
        return redirect("/")
    }

    const server = await db.server.findUnique({
        where: {
            id: serverId
        },
        include: {
            channel: {
                orderBy: {
                    createdAt: "asc"
                }
            },
            members: {
                include: {
                    profile: true,
                },
                orderBy: {
                    role: "asc",
                }
            }
        }
    })

    // Filter the text, audio and video channels
    const textChannels = server?.channel.filter((channel) => {channel.type === ChannelType.TEXT})
    const audioChannels = server?.channel.filter((channel) => {channel.type === ChannelType.AUDIO})
    const videoChannels = server?.channel.filter((channel) => {channel.type === ChannelType.VIDEO})

    // Get the list of all members in a particular server except yourself
    const members = server?.members.filter((member) => {member.profileId !== profile.id})

    if(!server){
        return redirect("/")
    }

    const role = server?.members.find((member) => member.profileId === profile.id)?.role
    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
            {/* Server Sidebar component */}            
            <ServerHeader
                server={server}
                role={role} />
        </div>
    )
}