import { CurrentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ChannelType, MemberRole } from "@prisma/client";
import { ServerHeader } from "./server-header";
import { ScrollArea } from "../ui/scroll-area";
import { ServerSearch } from "./server-search";
import {
  Divide,
  Hash,
  Mic,
  ShieldAlert,
  ShieldCheck,
  Video,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { ServerMember } from "./server-member";

interface ServerSidebarProps {
  serverId: string;
}

const iconMap = {
  [ChannelType.TEXT]: <Hash className="h-4 w-4 mr-2" />,
  [ChannelType.AUDIO]: <Mic className="h-4 w-4 mr-2" />,
  [ChannelType.VIDEO]: <Video className="h-4 w-4 mr-2" />,
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-indigo-500" />,
};

export const ServerSidebar = async ({
 serverId 
} : ServerSidebarProps) => {
  const profile = await CurrentProfile();

  if (!profile) {
    return redirect("/");
  }

  console.log("THIS THIS THIS");
  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channel: {
        orderBy: {
          createdAt: "asc",
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    },
  });

  // Filter the text, audio and video channels
  const textChannels = server?.channel.filter(
    (channel) => channel.type === ChannelType.TEXT
  );
  // console.log(`The number of textchannels are: ${textChannels?.length} \n The number of total channels are: ${server?.channel} \n`);

  const audioChannels = server?.channel.filter(
    (channel) => channel.type === ChannelType.AUDIO
  );
  // console.log(`The number of audiochannels are: ${audioChannels?.length} \n The number of total channels are: ${server?.channel} \n`);

  const videoChannels = server?.channel.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );
  // console.log(`The number of videochannels are: ${videoChannels?.length} \n The number of total channels are: ${server?.channel.length} \n`);

  // Get the list of all members in a particular server except yourself
  const members = server?.members.filter((member) => {
    return member.profileId !== profile.id;
  });
  // console.log(`The number of members are: ${members?.length} \n`);
  // console.log(`${server?.name} \n`);

  if (!server) {
    return redirect("/");
  }

  const role = server?.members.find(
    (member) => member.profileId === profile.id
  )?.role;
  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Text channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Audio channels",
                type: "channel",
                data: audioChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Video channels",
                type: "channel",
                data: videoChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members?.map((member) => ({
                  icon: roleIconMap[member.role],
                  name: member.profile.name ?? "No name",
                  id: member.id,
                })),
              },
            ]}
          ></ServerSearch>
        </div>
      </ScrollArea>
      <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
      {!!textChannels?.length && (
        <div className="mb-2 px-4">
          <ServerSection
            sectionType="channels"
            channelType={ChannelType.TEXT}
            role={role}
            label="Text Channels"
          />
          {textChannels.map((channel) => {
            return (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
            );
          })}
        </div>
      )}
      {!!audioChannels?.length && (
        <div className="mb-2 px-4">
          <ServerSection
            sectionType="channels"
            channelType={ChannelType.AUDIO}
            role={role}
            label="Voice Channels"
          />
          {audioChannels.map((channel) => {
            return (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
            );
          })}
        </div>
      )}
      {!!videoChannels?.length && (
        <div className="mb-2 px-4">
          <ServerSection
            sectionType="channels"
            channelType={ChannelType.VIDEO}
            role={role}
            label="Video Channels"
          />
          {videoChannels.map((channel) => {
            return (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
            );
          })}
        </div>
      )}
      {!!members?.length && (
        <div className="mb-2 px-4">
          <ServerSection
            sectionType="members"
            role={role}
            label="Members"
            server={server}
          />
            {members.map((member) => (
                  <ServerMember 
                    key={member.id}
                    member={member}
                    server={server}
                  />
            ))}
        </div>
      )}
    </div>
  );
};
