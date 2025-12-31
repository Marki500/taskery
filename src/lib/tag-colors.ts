// Tag color definitions with their visual styles
export const tagColors = {
    gray: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        dot: 'bg-gray-500'
    },
    red: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-300',
        dot: 'bg-red-500'
    },
    orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-300',
        dot: 'bg-orange-500'
    },
    yellow: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-300',
        dot: 'bg-yellow-500'
    },
    green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-300',
        dot: 'bg-green-500'
    },
    teal: {
        bg: 'bg-teal-100 dark:bg-teal-900/30',
        text: 'text-teal-700 dark:text-teal-300',
        dot: 'bg-teal-500'
    },
    blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
        dot: 'bg-blue-500'
    },
    indigo: {
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        dot: 'bg-indigo-500'
    },
    purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-300',
        dot: 'bg-purple-500'
    },
    pink: {
        bg: 'bg-pink-100 dark:bg-pink-900/30',
        text: 'text-pink-700 dark:text-pink-300',
        dot: 'bg-pink-500'
    },
} as const

export type TagColorName = keyof typeof tagColors

export const tagColorOptions: { value: TagColorName; label: string }[] = [
    { value: 'gray', label: 'Gris' },
    { value: 'red', label: 'Rojo' },
    { value: 'orange', label: 'Naranja' },
    { value: 'yellow', label: 'Amarillo' },
    { value: 'green', label: 'Verde' },
    { value: 'teal', label: 'Verde azulado' },
    { value: 'blue', label: 'Azul' },
    { value: 'indigo', label: 'Índigo' },
    { value: 'purple', label: 'Púrpura' },
    { value: 'pink', label: 'Rosa' },
]

export function getTagColorStyles(colorName: string | null | undefined) {
    if (!colorName || !(colorName in tagColors)) {
        return tagColors.gray
    }
    return tagColors[colorName as TagColorName]
}
