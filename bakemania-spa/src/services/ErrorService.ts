function anyErrorToDisplayError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    anyError: any
): string | null {

    if (!anyError) return 'Nieokreślony błąd.';

    let errorMessage = JSON.stringify(anyError);

    if (typeof anyError === 'string') {
        errorMessage = anyError.trim() ? anyError.trim() : 'Błąd z nieokreśloną wiadomością.';
    }

    if (anyError instanceof Object) {
        if ('message' in anyError) {
            errorMessage = JSON.stringify(anyError.message);
        } else {
            errorMessage = JSON.stringify(anyError);
        }
    }

    return errorMessage;

}

export default anyErrorToDisplayError