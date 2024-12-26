export default async function PopupCityListPage() {
    return <div className="page-width min-h-[100svh] pt-0 sm:pt-6 !pb-16">
        <h2 className="text-2xl font-semibold mb-3 md:flex-row flex items-center justify-between flex-col">
            Popup-Cities
        </h2>

        <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-2">
            {new Array(8).fill(0).map((_, index) => {
                return <a key={index} href={`/event/playground2`}
                    className="h-[292px] rounded shadow p-3">
                    <div className="rounded h-[148px] mb-3">
                        <img className="object-cover w-full h-full rounded"
                            src="https://ik.imagekit.io/soladata/5wrdgcma_x0R8W93Ih?tr=w-440,h-296" alt=""/>
                    </div>
                    <div className="webkit-box-clamp-1 text-xs">Wed, FEB 26 - Wed, MAR 05</div>
                    <div className="webkit-box-clamp-2 text-lg font-semibold leading-5 h-10 mb-4">Protopian
                        Convergence
                    </div>

                    <div className="flex items-end flex-row justify-between">
                        <div className="flex-1">
                            <div className="flex-row-item-center text-xs">
                                <i className={'uil-location-point mr-0.5'}></i>
                                <div className="webkit-box-clamp-1">Bangkok, Thailand</div>
                            </div>
                            <div className="flex-row-item-center text-xs">
                                <img className="w-3 h-3 rounded-full mr-0.5"
                                    src="/images/default_avatar/avatar_1.png" alt=""/>
                                <div className="webkit-box-clamp-1">by Protopian Convergence</div>
                            </div>
                        </div>
                        <div
                            className="hidden sm:block whitespace-nowrap text-xs bg-primary py-1.5 px-2 rounded font-semibold ml-1">
                            View events
                        </div>
                    </div>
                </a>
            })
            }
        </div>
    </div>
}
