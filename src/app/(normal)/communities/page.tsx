export default async function CommunitiesPage() {
    return <div className="page-width min-h-[100svh] pt-0 sm:pt-6 !pb-16">
        <h2 className="text-2xl font-semibold mb-3 md:flex-row flex items-center justify-between flex-col">
            Communities
        </h2>

        <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-2">
            {new Array(8).fill(0).map((_, index) => {
                return <a key={index} href={`/group/playground2`}
                    className="h-[200px] rounded shadow p-3">
                    <img className="object-cover w-16 h-16 rounded-full"
                        src="/images/default_avatar/avatar_1.png" alt=""/>
                    <div className="webkit-box-clamp-2 text-lg font-semibold leading-5 h-10 mb-4 mt-2">Protopian
                        Convergence
                    </div>

                    <div className="text-sm"><strong className="mr-1">123</strong>Members</div>
                    <div className="text-sm"><strong className="mr-1">12</strong>Events</div>
                </a>
            })
            }
        </div>
    </div>
}
