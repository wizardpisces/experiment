import { inject, injectable, Container } from '../index'

const container = new Container()

@injectable()
class PopMusic {
    getName() {
        return '流行音乐'
    }
}
container.bind('request1').to(PopMusic)

@injectable()
class ClassicalMusic {
    getName() {
        return '古典音乐'
    }
}
container.bind('request2').to(ClassicalMusic)

@injectable()
class Music {
    pm: any
    cm: any
    constructor(
        @inject('request1') popMusic: any,
        @inject('request2') classicalMusic: any) {
        this.pm = popMusic
        this.cm = classicalMusic
    }

    getName() {
        const result = this.pm.getName() + this.cm.getName()
        return result
    }
}
container.bind('Plan').to(Music)

const music: any = container.get('Plan')
console.log(music.getName()) // 流行音乐古典音乐