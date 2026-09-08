import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingSettlements from "./PendingSettlements";
import SettledSettlements from "./SettledSettlements";

/**
 * Manual (offline) seller settlements — the only place payouts get recorded.
 *
 * Pending shows what each seller is owed for delivered orders; Settled is the history
 * of transfers already made and stamped with a UTR.
 */
const SellerSettlements = () => {
  // The tab lives in the URL so coming back from an orders page (?tab=settled)
  // returns to the tab it was opened from.
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "settled" ? "settled" : "pending";

  return (
    <div className="bg-white rounded-xl">
      <div className="p-4">
        <Tabs
          value={tab}
          onValueChange={(next) =>
            // Replaced rather than pushed — flipping tabs should not fill up history.
            setSearchParams(next === "settled" ? { tab: "settled" } : {}, {
              replace: true,
            })
          }
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-black">Settlements</h2>
              <p className="text-xs text-gray-500">
                Pay sellers by bank transfer, then record the UTR here.
              </p>
            </div>
            <TabsList>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black px-4"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="settled"
                className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black px-4"
              >
                Settled
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pending">
            <PendingSettlements />
          </TabsContent>
          <TabsContent value="settled">
            <SettledSettlements />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerSettlements;
