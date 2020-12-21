const {
    createMethod
} = require("@substrate/txwrapper/lib/util");

/**
 * create did
 *
 * @param args - Arguments specific to this method.
 * @param info - Information required to construct the transaction.
 * @param options - Registry and metadata used for constructing the method.
 */
export function didCreate(
    args,
    info,
    options
) {
    return createMethod(
        {
            method: {
                args,
                name: 'didCreate',
                pallet: 'identitymeModule',
            },
            ...info,
        },
        options
    );
}