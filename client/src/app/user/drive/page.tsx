import DriveView from "@/components/user/DriveView";

export default function Page() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
            {/* Main container with responsive padding and overflow handling */}
            <div className="container mx-auto min-h-screen flex flex-col">
                {/* Header spacing for mobile/desktop */}
                <div className="flex-shrink-0 h-4 sm:h-6"></div>
                
                {/* Main content area with proper overflow handling */}
                <div className="flex-1 overflow-hidden">
                    <div className="h-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
                        {/* DriveView with constrained height and internal scrolling */}
                        <div className="h-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]">
                            <DriveView />
                        </div>
                    </div>
                </div>
                
                {/* Footer spacing */}
                <div className="flex-shrink-0 h-4 sm:h-6"></div>
            </div>
        </div>
    )
}