import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import {
  BUSINESS_DAY_FORMAT,
  businessDayToDayjs,
  dayjs,
} from "@/utils/dateRange";

const { RangePicker } = DatePicker;

export type BusinessDayRangeValue = {
  startDate?: string;
  endDate?: string;
};

interface BusinessDayRangePickerProps {
  value: BusinessDayRangeValue;
  onChange: (value: BusinessDayRangeValue) => void;
  className?: string;
  disabledFuture?: boolean;
}

/**
 * Ant Design range picker for the `Created At` filters.
 *
 * It emits plain IST business days (`YYYY-MM-DD`) rather than instants. The exact
 * UTC boundaries are derived later by `buildDateRangeParams`, which is shared by the
 * orders list and the CSV export — so the picked day always means the *IST* day, no
 * matter what timezone the admin's browser is in.
 */
export const BusinessDayRangePicker: React.FC<BusinessDayRangePickerProps> = ({
  value,
  onChange,
  className,
  disabledFuture = true,
}) => {
  const range: [Dayjs | null, Dayjs | null] = [
    businessDayToDayjs(value?.startDate),
    businessDayToDayjs(value?.endDate),
  ];

  return (
    <RangePicker
      className={className}
      value={range[0] || range[1] ? range : null}
      format="DD MMM YYYY"
      allowEmpty={[true, true]}
      placeholder={["Start date", "End date"]}
      // A modal Radix sheet sets `pointer-events: none` outside its content, so a
      // popup portalled to <body> would render but be unclickable. Mount it on the
      // sheet content instead (which is `fixed`, so it is a valid containing block
      // and is not clipped by the sheet's inner scroll area).
      getPopupContainer={(trigger) =>
        trigger.closest<HTMLElement>('[data-slot="sheet-content"]') ??
        trigger.parentElement ??
        document.body
      }
      disabledDate={
        disabledFuture ? (current) => current && current.isAfter(dayjs(), "day") : undefined
      }
      onChange={(dates) => {
        onChange({
          startDate: dates?.[0]?.format(BUSINESS_DAY_FORMAT) || undefined,
          endDate: dates?.[1]?.format(BUSINESS_DAY_FORMAT) || undefined,
        });
      }}
    />
  );
};

export default BusinessDayRangePicker;
