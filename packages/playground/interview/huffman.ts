/**
 * Author: @wizardpisces 
 * Contact: 1275839779@qq.com
 * Date: 2021-3-8
 * typescript version of https://github1s.com/wilkerlucio/huffman_js
 */

type FrequencyItem = [string | [FrequencyItem, FrequencyItem], number]
type FrequencyTable = FrequencyItem[]
type CompressedFrequencyItem = [string | CompressedFrequencyItem, string | CompressedFrequencyItem]

type HuffmanEncoded = CompressedFrequencyItem | string

/**
 * Pad a string, used to pad bits into a full byte
 */
function lpad(str: string = '', len: number = 8) {
    return '0'.repeat(len - str.length) + str;
}

/**
 * Huffman tree node type:
 * 1. [not Leaf node] have left, right child, do not have value
 * 2. [Leaf node] do not have left and right,  have value 
 */

class HuffmanTreeNode { // Hu left and right node will be Leaf
    left: HuffmanTreeNode | null = null
    right: HuffmanTreeNode | null = null
    value: string | null = null
    constructor() {

    }
    isLeaf() {
        return this.left === null && this.right === null
    }

    encode(): HuffmanEncoded {
        if (this.value) {
            return this.value
        }
        return [(<HuffmanTreeNode>this.left).encode(), (<HuffmanTreeNode>this.right).encode()]
    }
}

class HuffmanTree {
    root: HuffmanTreeNode
    leafCache: { [key: string]: string } = {}
    constructor(root: HuffmanTreeNode) {
        this.root = root || new HuffmanTreeNode()
    }

    stringToBitString(encoded: string) {
        if (!encoded) {
            return ''
        }

        let pieces = encoded.split(''),
            pad = parseInt(<string>pieces.pop()),
            bitString = ''

        bitString = pieces.map(ch => lpad(ch.charCodeAt(0).toString(2))).join('')

        return bitString.substr(0, bitString.length - pad)
    }

    bitStringToString(bitString: string) {
        let padByte = 8 - bitString.length % 8,
            encoded = ''
        bitString = bitString + '0'.repeat(padByte)

        for (let i = 0; i < bitString.length; i += 8) {
            encoded += String.fromCharCode(parseInt(bitString.substr(i, 8), 2))
        }

        encoded += padByte.toString()

        return encoded
    }

    encode(text: string): string {
        let bitString = this.encodeBitString(text)
        return this.bitStringToString(bitString)
    }

    decode(encoded: string): string {
        if (!encoded) {
            return ''
        }

        let decoded = '',
            bitString = this.stringToBitString(encoded),
            node: HuffmanTreeNode = this.root

        bitString.split('').forEach(direction => {
            let d: keyof HuffmanTreeNode = direction === '0' ? 'left' : 'right';
            node = node[d] as HuffmanTreeNode

            if (node.isLeaf()) {
                decoded += node.value
                node = this.root
            }
        })

        return decoded
    }

    encodeBitString(text: string): string {
        return text.split('').map(ch => this.bitValue(ch)).join('')
    }

    bitValue(ch: string) {
        if (!this.leafCache[ch]) {
            /**
             *  only run at first time call which will generate all ch related code
             */
            this.generateLeafCache()
        }
        return this.leafCache[ch]
    }

    generateLeafCache(node: HuffmanTreeNode = this.root, path: string = '') {
        if (node.isLeaf()) {
            this.leafCache[node.value as string] = path;
        } else {
            this.generateLeafCache(<HuffmanTreeNode>node.left, path + '0')
            this.generateLeafCache(<HuffmanTreeNode>node.right, path + '1')
        }
    }

    encodeTree(): HuffmanEncoded {
        return this.root.encode()
    }

    static decodeTree(data: HuffmanEncoded) {
        return new HuffmanTree(HuffmanTree.parseNode(data))
    }

    static parseNode(data: HuffmanEncoded): HuffmanTreeNode {
        let node = new HuffmanTreeNode()

        if (Array.isArray(data)) {
            node.left = HuffmanTree.parseNode(data[0]);
            node.right = HuffmanTree.parseNode(data[1]);
        } else {
            node.value = data
        }

        return node
    }
}

class HuffmanTreeBuilder {
    rawString: string
    constructor(text: string) {
        this.rawString = text;
    }

    build() {
        let table = this.buildFrequencyTable()
        let item = this.combineTable(table)
        let compressedTable = this.compressCombinedTable(item)
        return HuffmanTree.decodeTree(compressedTable)
    }

    frequencySorter(a: FrequencyItem, b: FrequencyItem): number {
        return a[1] - b[1]
    }

    combineTable(table: FrequencyTable): FrequencyItem {
        while (table.length > 1) {
            let first = table.shift() as FrequencyItem
            let second = table.shift() as FrequencyItem
            table.unshift([[first, second], first[1] + second[1]])
            table.sort(this.frequencySorter)
        }
        return table[0]
    }

    buildFrequencyTable(): FrequencyTable {
        let tableHash: { [key: string]: number } = {};

        this.rawString.split('').forEach(chr => {
            tableHash[chr] = tableHash[chr] ? tableHash[chr] + 1 : 1;
        })

        return Object.entries(tableHash).sort(this.frequencySorter)
    }

    compressCombinedTable(item: FrequencyItem): HuffmanEncoded {
        let value: FrequencyItem[0] = item[0];
        if (Array.isArray(value)) {
            return [this.compressCombinedTable(value[0]), this.compressCombinedTable(value[1])]
        }

        return value
    }

}

class Huffman {
    public static treeFromText(text: string) {
        let builder = new HuffmanTreeBuilder(text)
        return builder.build()
    }

    public static decodeTree(data: HuffmanEncoded) {
        return HuffmanTree.decodeTree(data)
    }
}



function testHuffman1() {
    console.log('testHuffman1 start......')

    let text = 'BCAADDDCCACACAC'
    // let text = 'do or do not';

    let huffman: HuffmanTree = Huffman.treeFromText(text); // generate the tree
    console.log(huffman)

    let treeEncoded: HuffmanEncoded = huffman.encodeTree(); // will return an javascript array with tree representation
    console.log(treeEncoded)

    let treeAgain = Huffman.decodeTree(treeEncoded); // restore the tree based on array representation
    console.log(treeAgain)

    let treeJSON = JSON.stringify(treeEncoded); // get a JSON string for easy transportation

    console.log('testHuffman1 end......\n')

}

function testHuffman2() {
    console.log('testHuffman2 start......')

    let text = 'BCAADDDCCACACAC'
    let huffman: HuffmanTree = Huffman.treeFromText(text); // first we need to create the tree to make encoding/decoding
    let encoded = huffman.encode(text); // will return the compressed version of text
    console.log(encoded, encoded.length)

    let decoded = huffman.decode(encoded); // will decode text to original version
    console.log(decoded)
    console.log('testHuffman2 end......')
}

testHuffman1()
testHuffman2()