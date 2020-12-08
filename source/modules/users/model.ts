import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { comparePassword, generatePassword } from "app/utils/bcrypt";

@Entity()
@Unique(["email"])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: "first_name",
        length: 30
    })
    firstName: string;

    @Column({
        name: "second_name",
        length: 30
    })
    secondName: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    created_at: Date;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    updated_at: Date;

    constructor(literal?: Partial<User>) {
        if (!literal) { return; }
        this.firstName = literal.firstName;
        this.secondName = literal.secondName;
        this.email = literal.email;
        this.password = literal.password;
    }

    @BeforeInsert()
    async hashPassword() {
        this.password = await generatePassword(this.password);
    }

    async comparePassword(password: string) {
        return await comparePassword(password, this.password);
    }
}