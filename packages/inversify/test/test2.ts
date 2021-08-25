import { inject, injectable, Container } from '../index'
import { expect } from './util'

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
        // @ts-ignore
        @inject('request1') popMusic: any,
        // @ts-ignore
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

expect(music.getName()).eql('流行音乐古典音乐') // 流行音乐古典音乐