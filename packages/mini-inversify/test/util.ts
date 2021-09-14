export {
    expect
}

function expect(input: any) {
    return {
        eql(val: any) {
            console.log(`expect ${input} eql to ${val} :`, input === val)
        }
    }
}