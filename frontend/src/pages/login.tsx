import { Button, ButtonOr, Divider, Form, FormButton, Icon } from 'semantic-ui-react'
import styles from '../@scss/login.module.scss'
import { useState } from 'react'

const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const validateEmail = (email: string) => {
		const re = /\S+@\S+\.\S+/
		return re.test(email)
	}

	return (
		<div className={styles.blackout}>
			<div className={styles.container}>
				<div className={styles.login}>
					<div className={styles.title}>Login</div>
					<form>
						<Form>
							<Form.Field error={email && !validateEmail(email)}>
								<Form.Input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
							</Form.Field>
							<Form.Field>
								<Form.Input type="password" placeholder="Password" />
							</Form.Field>
						</Form>
						<Button
							compact
							fluid
							style={{
								marginTop: 10,
								padding: '12px',
								borderRadius: 8,
								fontSize: 15,
								fontWeight: 550,
								background: 'rgb(149, 100, 255)',
								color: 'white',
							}}
						>
							Login
						</Button>
						{/* <a className={styles.register} href="/register">
							Register
						</a> */}
					</form>

					<Divider horizontal>OR</Divider>

					<div className={styles.social}>
						<Button color="facebook">
							<Icon name="facebook f" />
						</Button>
						<Button color="google plus">
							<Icon name="google plus g" />
						</Button>
						<Button color="twitter">
							<Icon name="twitter" />
						</Button>
					</div>
				</div>
				<div className={styles.register}>
					<div className={styles.title}>Dont have an account?</div>
					<div className={styles.content}>
						{/* get access to sports as soon as they become available,  */}
						<div className={styles.pitch}>
							<Icon name="calendar check outline" style={{ color: 'white', fontSize: 30 }} />

							<span>View sports as soon as they become available!</span>
						</div>

						<div className={styles.pitch}>
							<Icon name="clock outline" style={{ color: 'white', fontSize: 30 }} />
							<span>Get access to automatic notifications!</span>
						</div>

						<div className={styles.pitch}>
							<Icon name="football ball" style={{ color: 'white', fontSize: 35 }} />
							<span>Ability to track and get suggestion based on your favorite sports and teams!</span>
						</div>

						<div>
							<a
								style={{
									marginTop: 10,
									padding: '12px',
									borderRadius: 8,
									fontSize: 15,
									fontWeight: 550,
									// background: 'rgb(149, 100, 255)',
									fontFamily: 'Lato, "Helvetica Neue", Arial, Helvetica, sans-serif',
									color: 'white',
								}}
								href="/register"
							>
								<Icon name="arrow alternate circle right" />
								Register
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Login
