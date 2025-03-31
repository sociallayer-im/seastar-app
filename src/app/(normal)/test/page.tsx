import {getBadgeDetailByOwnerHandle, getBadgeClassDetailByOwnerHandle, getBadgeAndBadgeClassByOwnerHandle} from "@sola/sdk"

import TestClient from "./Client"
import TestClient2 from './Client2'

export default async function Test() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部横幅 */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Web3 开发者大会 2024</h1>
                    <p className="text-xl opacity-90">探索区块链技术的无限可能</p>
                </div>
            </div>

            {/* 主要内容区 */}
            <div className="container mx-auto px-4 py-12">
                {/* 活动信息卡片 */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">活动时间</h3>
                            <p className="text-gray-600">2024年4月15日 - 4月17日</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">活动地点</h3>
                            <p className="text-gray-600">线上直播 + 线下会场</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">参与方式</h3>
                            <p className="text-gray-600">免费报名，名额有限</p>
                        </div>
                    </div>
                </div>
                {/* 活动日程表 */}
                <div className="bg-white rounded-lg shadow-lg">
                <iframe src="https://app.sola.day/schedule/list/infinitacity?" width="100%" height="600px" frameBorder="0" allowFullScreen></iframe>

                </div>
            </div>
        </div>
    )
}