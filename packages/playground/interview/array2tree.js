// 实现 array2tree 满足以下条件

let arr = [{
    level: 1
}, {
    level: 2
}, {
    level: 3
}, {
    level: 2
}, {
    level: 3
}, {
    level: 1
}, {
    level: 2
}];

let tree = array2tree(arr)

console.log(JSON.stringify(tree) === JSON.stringify([{
        level: 1,
        children: [{
                level: 2,
                children: [{
                    level: 3,
                    children:[]
                }]
            },
            {
                level: 2,
                children: [{
                    level: 3,
                    children: []
                }]
            }
        ]
    },
    {
        level: 1,
        children: [{
            level: 2,
            children: []
        }]
    }
])) // true






















































// one possible solution
function array2tree(arr) {
    arr = arr.map(item => {
        return {
            ...item,
            children: [],
        }
    })

    // create virtual root
    let root = {
        level: 0,
        children: []
    }

    let prevItem = root
    let visited = [root]

    // search visited from end to start, to find closest parent
    const findClosestParent = (hItem) => {
        for (let len = visited.length, i = len - 1; i >= 0; i--) {
            if (visited[i].level < hItem.level) {
                return visited[i]
            }
        }
    }

    arr.forEach((item) => {
        if (prevItem.level < item.level) {
            prevItem.children.push(item)
            prevItem = item
        } else if (prevItem.level >= item.level) {
            let closestParent = findClosestParent(item)
            closestParent.children.push(item)
            prevItem = item
        }
        visited.push(item)
    })

    return root.children
}