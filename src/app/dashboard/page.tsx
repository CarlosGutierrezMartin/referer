import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Video, ExternalLink, LogOut, Settings } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getYouTubeThumbnail } from '@/lib/youtube';
import type { Video as VideoType } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getVideos(userId: string): Promise<VideoType[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching videos:', error);
        return [];
    }

    return data || [];
}

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const videos = await getVideos(user.id);

    return (
        <div className="min-h-screen bg-[#0A0A0B]">
            {/* Header */}
            <header className="bg-[#0A0A0B] border-b border-[#27272A] sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2.5">
                            <Image src="/logo.png" alt="Referer" width={28} height={28} className="invert brightness-200" />
                            <span className="text-lg font-semibold text-[#F4F4F5] tracking-tight">Referer</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-[#71717A] hidden sm:block">
                                {user.email}
                            </span>
                            <Link href="/dashboard/settings">
                                <Button variant="ghost" size="sm">
                                    <Settings className="w-4 h-4" />
                                    <span className="hidden sm:inline">Ajustes</span>
                                </Button>
                            </Link>
                            <form action="/auth/signout" method="post">
                                <Button variant="ghost" size="sm" type="submit">
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Salir</span>
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#F4F4F5] tracking-tight">Tus videos</h1>
                        <p className="text-[#71717A] text-sm mt-1">
                            Gestiona las referencias de tus videos
                        </p>
                    </div>
                    <Link href="/dashboard/new">
                        <Button>
                            <Plus className="w-4 h-4" />
                            Añadir video
                        </Button>
                    </Link>
                </div>

                {videos.length === 0 ? (
                    /* Empty State */
                    <Card variant="outlined" padding="lg" className="text-center py-20">
                        <Video className="w-12 h-12 text-[#3F3F46] mx-auto mb-4" />
                        <h2 className="text-lg font-medium text-[#F4F4F5] mb-2">
                            Sin videos todavía
                        </h2>
                        <p className="text-sm text-[#71717A] mb-6 max-w-sm mx-auto">
                            Añade tu primer video de YouTube para empezar a vincular fuentes.
                        </p>
                        <Link href="/dashboard/new">
                            <Button>
                                <Plus className="w-4 h-4" />
                                Añadir tu primer video
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    /* Video Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {videos.map((video) => (
                            <Link key={video.id} href={`/dashboard/${video.id}`}>
                                <Card
                                    padding="none"
                                    className="overflow-hidden hover:border-[#3F3F46] transition-all duration-150 cursor-pointer group"
                                >
                                    <div className="aspect-video relative bg-[#1A1A1E]">
                                        <img
                                            src={video.thumbnail_url || getYouTubeThumbnail(video.youtube_id)}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-[#F4F4F5] line-clamp-2 text-sm">
                                            {video.title}
                                        </h3>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs text-[#52525B]">
                                                {new Date(video.created_at).toLocaleDateString('es-ES')}
                                            </span>
                                            <ExternalLink className="w-3.5 h-3.5 text-[#3F3F46] group-hover:text-[#71717A] transition-colors" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
