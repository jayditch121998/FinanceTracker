import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            {children}
        </svg>
    );
}

export const HomeIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20h14V9.5" />
        <path d="M10 20v-5h4v5" />
    </Icon>
);

export const ListIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <circle cx="3.5" cy="6" r="1" />
        <circle cx="3.5" cy="12" r="1" />
        <circle cx="3.5" cy="18" r="1" />
    </Icon>
);

export const TargetIcon = (p: IconProps) => (
    <Icon {...p}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
    </Icon>
);

export const PiggyIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M19 9.5c.8.4 1.5 1 2 1.8" />
        <path d="M5 11a7 6 0 0 1 7-5.5c3.9 0 7 2.7 7 6 0 1.6-.7 3-1.9 4.1L17 19h-2.5l-.6-1.3a8 8 0 0 1-3.8 0L9.5 19H7l-.5-2.6A5.7 5.7 0 0 1 5 13.5H3v-3h2Z" />
        <circle cx="15" cy="10.5" r="0.8" />
        <path d="M10 6.2 9 3.5l3 1.2" />
    </Icon>
);

export const TagIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
        <circle cx="8" cy="8" r="1.5" />
    </Icon>
);

export const LogoutIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5M21 12H9" />
    </Icon>
);

export const ChevronLeftIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="m15 18-6-6 6-6" />
    </Icon>
);

export const ChevronRightIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="m9 18 6-6-6-6" />
    </Icon>
);

export const PlusIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M12 5v14M5 12h14" />
    </Icon>
);

export const PencilIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icon>
);

export const TrashIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </Icon>
);

export const XIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
);
